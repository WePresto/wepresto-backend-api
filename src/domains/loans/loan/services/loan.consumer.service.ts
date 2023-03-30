import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan } from '../loan.entity';
import { MovementType } from '../../movement/movement.entity';

import { LoanReadService } from './loan.read.service';
import { WeprestoSlackService } from '../../../../plugins/wepresto-slack/wepresto-slack.service';
import { EventMessageService } from '../../../event-message/event-message.service';
import { FrenchAmortizationSystemService } from '../../french-amortization-system/french-amortization-system.service';

import { getRabbitMQExchangeName } from '../../../../utils';

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
        `loan created ${loanUid} consumer called with input: ${JSON.stringify(
          input,
        )}`,
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
}
