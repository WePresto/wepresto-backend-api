import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';

import appConfig from '../../../../config/app.config';

import { Movement, MovementType } from '../movement.entity';

import { getRabbitMQExchangeName } from '../../../../utils';

import { MovementReadService } from './movement.read.service';
import { EventMessageService } from '../../../event-message/event-message.service';
import { LoanService } from '../../loan/services/loan.service';
import { FrenchAmortizationSystemService } from '../../french-amortization-system/french-amortization-system.service';

const RABBITMQ_EXCHANGE = getRabbitMQExchangeName();

@Injectable()
export class MovementConsumerService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
    private readonly readService: MovementReadService,
    private readonly eventMessageService: EventMessageService,
    private readonly loanService: LoanService,
    private readonly frenchAmortizationSystemService: FrenchAmortizationSystemService,
  ) {}

  @RabbitRPC({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: `${RABBITMQ_EXCHANGE}.payment_created`,
    queue: `${RABBITMQ_EXCHANGE}.${MovementConsumerService.name}.payment_created`,
  })
  public async paymentCreatedConsumer(input: any) {
    const eventMessage = await this.eventMessageService.create({
      routingKey: `${RABBITMQ_EXCHANGE}.payment_created`,
      functionName: 'paymentCreatedConsumer',
      data: input,
    });

    try {
      const { movementUid } = input;

      // get the movement
      const existingPayment = await this.readService.getOne({
        uid: movementUid,
      });

      // check if the movement is a payment
      if (!existingPayment.type.startsWith(MovementType.PAYMENT)) {
        throw new Error(`movement ${existingPayment.uid} is not a payment`);
      }

      // get the minimum amount to pay
      const {
        totalAmount: minimumPaymentAmount,
        movements: minimalMovementsToPay,
      } = await this.loanService.readService.getMinimumPaymentAmount({
        uid: existingPayment.uid,
      });

      // check if the payment is enough
      if (existingPayment.amount * -1 < minimumPaymentAmount) {
        // TODO: update the payment movement to indicate thet the payment must be soft deleted marked as "not enough to pay the loan"

        throw new Error(
          `payment ${existingPayment.uid} is not enough to pay the loan`,
        );
      }

      // update the movements as paid
      await this.movementRepository.update(
        {
          id: In(minimalMovementsToPay.map((movement) => movement.id)),
        },
        {
          paid: true,
        },
      );

      let comment;

      // if the payment is greater than the minimum amount to pay...
      if (existingPayment.amount * -1 > minimumPaymentAmount) {
        const { loan } = existingPayment;

        // get the missing installments to pay  (if any)
        const missingInstallments = await this.movementRepository.find({
          where: {
            loan: { id: loan.id },
            paid: false,
            type: MovementType.LOAN_INSTALLMENT,
          },
        });

        if (!missingInstallments.length) {
          // TODO: update the loan as paid
        }

        // get the total principal amount of the loan
        const totalPrincipalDebt = missingInstallments.reduce(
          (total, movement) => total + movement.principal,
          0,
        );

        // determine the amount to re calculate the installments
        const newPrincipalDebt =
          totalPrincipalDebt -
          (existingPayment.amount * -1 - minimumPaymentAmount);

        // re calculate the installments
        let newInstallments;
        if (existingPayment.type === MovementType.PAYMENT_TERM_REDUCTION) {
          // IF THE EXTRA PAYMENT IS TO REDUCE THE NUMBER OF THE INSTALLMENTS

          newInstallments = [];
          let newPrincipalDebtInInstallments = newPrincipalDebt;
          for (let i = 0; i < missingInstallments.length; i++) {
            const installment = missingInstallments[i];

            if (newPrincipalDebt <= 0) break;

            if (newPrincipalDebtInInstallments > installment.principal) {
              newInstallments = [
                ...newInstallments,
                {
                  ...installment,
                  id: undefined,
                  createdAt: undefined,
                  updatedAt: undefined,
                },
              ];
              newPrincipalDebtInInstallments -= installment.principal;
            } else {
              const interest =
                newPrincipalDebtInInstallments * (loan.annualInterestRate / 12);

              newInstallments = [
                ...newInstallments,
                {
                  ...installment,
                  id: undefined,
                  createdAt: undefined,
                  updatedAt: undefined,
                  principal: newPrincipalDebtInInstallments,
                  interest,
                  amount: newPrincipalDebtInInstallments + interest,
                  balance: 0,
                },
              ];
              newPrincipalDebtInInstallments = 0;
            }
          }
        } else {
          // IF THE EXTRA PAYMENT IS TO REDUCE THE AMOUNT OF THE INSTALLMENTS

          // get the new installments
          newInstallments =
            await this.frenchAmortizationSystemService.getLoanInstallments({
              amount: newPrincipalDebt,
              annualInterestRate: loan.annualInterestRate,
              term: missingInstallments.length,
              // getting the due date of the last installment that was paid
              referenceDate: minimalMovementsToPay
                .filter(
                  (movement) => movement.type === MovementType.LOAN_INSTALLMENT,
                )
                .slice(-1)[0].dueDate,
            });
        }

        // create the new installments
        const createdInstallments = newInstallments.map((installment) => {
          return this.movementRepository.create({
            ...installment,
            loan: { id: loan.id },
            type: MovementType.LOAN_INSTALLMENT,
            paid: false,
          });
        });

        await Promise.all([
          // soft delete the installments
          this.movementRepository.softDelete({
            id: In(missingInstallments.map((movement) => movement.id)),
          }),
          // save the new installments
          this.movementRepository.save(createdInstallments),
        ]);

        comment = `The payment was greater than the minimum amount to pay, so the installments were recalculated. The new installments are: ${createdInstallments.length}`;
      }

      // update the movement as processed
      const preloadedPayment = await this.movementRepository.preload({
        id: existingPayment.id,
        comment,
        processed: true,
      });

      await this.movementRepository.save(preloadedPayment);
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
