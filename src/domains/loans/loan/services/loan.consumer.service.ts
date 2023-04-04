import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan, LoanStatus } from '../loan.entity';
import { MovementType } from '../../movement/movement.entity';

import { LoanReadService } from './loan.read.service';
import { WeprestoSlackService } from '../../../../plugins/wepresto-slack/wepresto-slack.service';
import { EventMessageService } from '../../../event-message/event-message.service';
import { NotificationService } from '../../../notification/notification.service';
import { FrenchAmortizationSystemService } from '../../french-amortization-system/french-amortization-system.service';

import {
  getNumberOfDays,
  getRabbitMQExchangeName,
  formatDate,
} from '../../../../utils';

const RABBITMQ_EXCHANGE = getRabbitMQExchangeName();

@Injectable()
export class LoanConsumerService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly readService: LoanReadService,
    private readonly weprestoSlackService: WeprestoSlackService,
    private readonly eventMessageService: EventMessageService,
    private readonly notificationService: NotificationService,
    private readonly frenchAmortizationSystemService: FrenchAmortizationSystemService,
  ) {}

  @RabbitRPC({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: `${RABBITMQ_EXCHANGE}.loan_disbursement`,
    queue: `${RABBITMQ_EXCHANGE}.${LoanConsumerService.name}.loan_disbursement`,
  })
  public async loanDisbursementConsumer(input: any) {
    const eventMessage = await this.eventMessageService.create({
      routingKey: `${RABBITMQ_EXCHANGE}.loan_disbursement`,
      functionName: 'loanDisbursementConsumer',
      data: input,
    });

    try {
      const { loanUid } = input;

      Logger.log(
        `loanDisbursementConsumer: loan ${loanUid} received`,
        LoanConsumerService.name,
      );

      // get the loan
      const existingLoan = await this.readService.getOne({
        uid: loanUid,
      });

      // get the loan installments
      const loanInstallments =
        this.frenchAmortizationSystemService.getLoanInstallments({
          amount: existingLoan.amount,
          annualInterestRate: existingLoan.annualInterestRate,
          term: existingLoan.term,
          referenceDate: existingLoan.startDate,
        });

      // eslint-disable-next-line no-console
      // console.table(loanInstallments);

      // create the loan installments movements
      const preloadedLoan = await this.loanRepository.preload({
        id: existingLoan.id,
        movements: loanInstallments.map((loanInstallment) => ({
          type: MovementType.LOAN_INSTALLMENT,
          amount: loanInstallment.amount,
          interest: loanInstallment.interest,
          principal: loanInstallment.principal,
          balance: loanInstallment.balance,
          dueDate: loanInstallment.dueDate,
          paid: false,
        })),
      });

      // save the loan with the movements
      await this.loanRepository.save(preloadedLoan);

      Logger.log(
        `loanDisbursementConsumer: loan ${loanUid} disbursement completed`,
        LoanConsumerService.name,
      );
    } catch (error) {
      console.error(error);

      const message = error.message;

      await this.eventMessageService.setError({
        id: eventMessage._id,
        error,
      });

      return {
        status: error.status || 500,
        message,
        data: {},
      };
    }
  }

  @RabbitRPC({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: `${RABBITMQ_EXCHANGE}.loan_application`,
    queue: `${RABBITMQ_EXCHANGE}.${LoanConsumerService.name}.loan_application`,
  })
  public async loanApplicationConsumer(input: any) {
    const eventMessage = await this.eventMessageService.create({
      routingKey: `${RABBITMQ_EXCHANGE}.loan_application`,
      functionName: 'loanApplicationConsumer',
      data: input,
    });

    try {
      const { loanUid } = input;

      Logger.log(
        `loanApplicationConsumer: loan ${loanUid} received`,
        LoanConsumerService.name,
      );

      // get the loan
      const existingLoan = await this.loanRepository
        .createQueryBuilder('loan')
        .innerJoinAndSelect('loan.borrower', 'borrower')
        .innerJoinAndSelect('borrower.user', 'user')
        .where('loan.uid = :loanUid', { loanUid })
        .getOne();

      // send the message
      await this.weprestoSlackService.sendNewLoanApplicationMessage({
        loan: existingLoan,
      });
    } catch (error) {
      console.error(error);

      const message = error.message;

      await this.eventMessageService.setError({
        id: eventMessage._id,
        error,
      });

      return {
        status: error.status || 500,
        message,
        data: {},
      };
    }
  }

  @RabbitRPC({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: `${RABBITMQ_EXCHANGE}.send_early_payment_notifications`,
    queue: `${RABBITMQ_EXCHANGE}.${LoanConsumerService.name}.send_early_payment_notifications`,
  })
  public async sendEarlyPaymentNotificationsConsumer(input: any) {
    const eventMessage = await this.eventMessageService.create({
      routingKey: `${RABBITMQ_EXCHANGE}.send_early_payment_notifications`,
      functionName: 'sendEarlyPaymentNotificationsConsumer',
      data: input || {},
    });

    try {
      // get the loans that are DISBURSED with them movements
      const loans = await this.loanRepository
        .createQueryBuilder('loan')
        .innerJoinAndSelect('loan.borrower', 'borrower')
        .innerJoinAndSelect('borrower.user', 'user')
        .innerJoinAndSelect('loan.movements', 'movement')
        .where('loan.status = :status', { status: LoanStatus.DISBURSED })
        .getMany();

      // just getting the loans that doesn't have any movement with the type OVERDUE_INTEREST
      const filteredLoans = loans.filter((loan) => {
        const overdueInterestMovements = loan.movements.find((movement) => {
          return movement.type === MovementType.OVERDUE_INTEREST;
        });

        return !overdueInterestMovements;
      });

      // iterate over the loans
      for (const loan of filteredLoans) {
        // the the first movement with the type LOAN_INSTALLMENT is not paid
        const firstUnpaidLoanInstallment = loan.movements.find((movement) => {
          return (
            movement.type === MovementType.LOAN_INSTALLMENT && !movement.paid
          );
        });

        // get the difference in days between the due date and the current date
        const { dueDate } = firstUnpaidLoanInstallment;

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const numberOfDays = getNumberOfDays(currentDate, dueDate);

        const {
          app: { selftWebUrl },
        } = this.appConfiguration;

        switch (numberOfDays) {
          case 0:
            await this.notificationService.sendEarlyPaymentNotificationC({
              email: loan.borrower.user.email,
              firstName: loan.borrower.user.fullName.split(' ')[0],
              alias: loan.alias || '' + loan.id,
              link: `${selftWebUrl}/home`,
            });
            break;
          case 3:
            await this.notificationService.sendEarlyPaymentNotificationB({
              email: loan.borrower.user.email,
              firstName: loan.borrower.user.fullName.split(' ')[0],
              alias: loan.alias || '' + loan.id,
              link: `${selftWebUrl}/home/loans`,
            });
            break;
          case 10:
            await this.notificationService.sendEarlyPaymentNotificationA({
              email: loan.borrower.user.email,
              firstName: loan.borrower.user.fullName.split(' ')[0],
              alias: loan.alias || '' + loan.id,
              dueDate: formatDate(dueDate, 'UTC'),
            });
            break;
          default:
            Logger.log(
              `loan ${loan.uid} has no early payment notification to send`,
              LoanConsumerService.name,
            );
            break;
        }
      }
    } catch (error) {
      console.error(error);

      const message = error.message;

      await this.eventMessageService.setError({
        id: eventMessage._id,
        error,
      });

      return {
        status: error.status || 500,
        message,
        data: {},
      };
    }
  }
}
