import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';

import appConfig from '../../../../config/app.config';

import { Movement, MovementType } from '../movement.entity';
import { LoanStatus } from '../../loan/loan.entity';

import {
  addDays,
  getNumberOfDays,
  getRabbitMQExchangeName,
  getReferenceDate,
  isSameDay,
} from '../../../../utils';
import { getFileExtensionByMimeType } from '../../../../utils/get-file-extension.util';

import { MovementReadService } from './movement.read.service';
import { GoogleStorageService } from '../../../../plugins/google-storage/google-storage.service';
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
    private readonly googleStorageService: GoogleStorageService,
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
      const { movementUid, base64File } = input;

      Logger.log(
        `paymentCreatedConsumer: payment ${movementUid} received`,
        MovementConsumerService.name,
      );

      // get the movement
      const existingPayment = await this.readService.getOne({
        uid: movementUid,
      });

      // check if the movement is a payment
      if (!existingPayment.type.startsWith(MovementType.PAYMENT)) {
        throw new Error(`movement ${existingPayment.uid} is not a payment`);
      }

      // check if the payment is already processed
      if (existingPayment.processed) {
        throw new Error(`payment ${existingPayment.uid} is already processed`);
      }

      // extract the loan from the movement
      const { loan } = existingPayment;

      // get the minimum amount to pay
      const {
        totalAmount: minimumPaymentAmount,
        movements: minimalMovementsToPay,
      } = await this.loanService.readService.getMinimumPaymentAmount({
        uid: loan.uid,
        referenceDate: existingPayment.movementDate
          ? getReferenceDate(new Date(existingPayment.movementDate), 'UTC')
          : getReferenceDate(new Date()),
      });

      Logger.log(
        `paymentCreatedConsumer: minimumPaymentAmount: ${minimumPaymentAmount} minimalMovementsToPay: ${minimalMovementsToPay.length}`,
        MovementConsumerService.name,
      );

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

      Logger.log(
        `paymentCreatedConsumer: minimalMovementsToPay: ${minimalMovementsToPay.length} are now paid`,
        MovementConsumerService.name,
      );

      let comment;

      // if the payment is greater than the minimum amount to pay...
      if (existingPayment.amount * -1 > minimumPaymentAmount) {
        Logger.log(
          `paymentCreatedConsumer: the payment ${existingPayment.uid} is greater than the minimum amount to pay`,
          MovementConsumerService.name,
        );

        // get the missing installments to pay  (if any)
        const missingInstallments = await this.movementRepository.find({
          where: {
            loan: { id: loan.id },
            paid: false,
            type: MovementType.LOAN_INSTALLMENT,
          },
        });

        Logger.log(
          `paymentCreatedConsumer: missingInstallments: ${missingInstallments.length}`,
          MovementConsumerService.name,
        );

        if (!missingInstallments.length) {
          // TODO: update the loan as paid

          Logger.log(
            `paymentCreatedConsumer: the loan ${loan.uid} is now paid`,
            MovementConsumerService.name,
          );
        }

        // get the total principal amount of the loan
        const totalPrincipalDebt = missingInstallments.reduce(
          (total, movement) => total + movement.principal,
          0,
        );

        Logger.log(
          `paymentCreatedConsumer: totalPrincipalDebt: ${totalPrincipalDebt}`,
          MovementConsumerService.name,
        );

        // determine the amount to re calculate the installments
        const newPrincipalDebt =
          totalPrincipalDebt -
          (existingPayment.amount * -1 - minimumPaymentAmount);

        Logger.log(
          `paymentCreatedConsumer: newPrincipalDebt: ${newPrincipalDebt}`,
          MovementConsumerService.name,
        );

        // re calculate the installments
        let newInstallments;
        if (existingPayment.type === MovementType.PAYMENT_TERM_REDUCTION) {
          // IF THE EXTRA PAYMENT IS TO REDUCE THE NUMBER OF THE INSTALLMENTS

          Logger.log(
            `paymentCreatedConsumer: the payment ${existingPayment.uid} is to reduce the number of the installments`,
            MovementConsumerService.name,
          );

          newInstallments = [];

          // distribute the new principal debt to the missing installments
          let newPrincipalDebtInInstallments = newPrincipalDebt;
          for (let i = 0; i < missingInstallments.length; i++) {
            const installment = missingInstallments[i];

            // if the new principal debt in installments is less than or equal to zero
            // means that the debt was distributed to all the installments
            // so we can break the loop
            if (newPrincipalDebtInInstallments <= 0) break;

            // if the new principal debt in installments is greater than the installment principal
            // means it (new principal debt in installments) can hold the full principal of the installment
            // so we can add the installment to the new installments
            if (newPrincipalDebtInInstallments > installment.principal) {
              newInstallments = [
                ...newInstallments,
                {
                  ...installment,
                  id: undefined,
                  uid: undefined,
                  createdAt: undefined,
                  updatedAt: undefined,
                  balance:
                    newPrincipalDebtInInstallments - installment.principal,
                },
              ];
              newPrincipalDebtInInstallments -= installment.principal;
            } else {
              // otherwise, new principal debt in installments is less than the installment principal
              // means this is the last installment to be added to the new installments
              // so we can add the installment to the new installments

              const interest =
                newPrincipalDebtInInstallments * (loan.annualInterestRate / 12);

              newInstallments = [
                ...newInstallments,
                {
                  ...installment,
                  id: undefined,
                  uid: undefined,
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

          Logger.log(
            `paymentCreatedConsumer: the payment ${existingPayment.uid} is to reduce the amount of the installments`,
            MovementConsumerService.name,
          );

          let referenceDate;
          if (minimalMovementsToPay.length) {
            // getting the due date of the last installment that was paid
            referenceDate = minimalMovementsToPay
              .filter(
                (movement) => movement.type === MovementType.LOAN_INSTALLMENT,
              )
              .slice(-1)[0].dueDate;
          } else {
            // get the due date of the last installment that was paid
            const { dueDate } = await this.movementRepository.findOne({
              where: {
                loan: { id: loan.id },
                paid: true,
                type: MovementType.LOAN_INSTALLMENT,
              },
              order: {
                dueDate: 'DESC',
              },
            });

            referenceDate = dueDate;
          }

          Logger.log(
            `paymentCreatedConsumer: referenceDate to calculate the new installments: ${referenceDate}`,
            MovementConsumerService.name,
          );

          // get the new installments
          newInstallments =
            await this.frenchAmortizationSystemService.getLoanInstallments({
              amount: newPrincipalDebt,
              annualInterestRate: loan.annualInterestRate,
              term: missingInstallments.length,
              referenceDate,
            });
        }

        Logger.log(
          `paymentCreatedConsumer: newInstallments: ${newInstallments.length}`,
          MovementConsumerService.name,
        );

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

        Logger.log(
          `paymentCreatedConsumer: the installments were recalculated and saved`,
          MovementConsumerService.name,
        );

        comment = `The payment was greater than the minimum amount to pay, so the installments were recalculated`;
      }

      // update the movement as processed
      const preloadedPayment = await this.movementRepository.preload({
        id: existingPayment.id,
        comment,
        processed: true,
      });

      await this.movementRepository.save(preloadedPayment);

      Logger.log(
        `paymentCreatedConsumer: the payment ${existingPayment.uid} was processed`,
        MovementConsumerService.name,
      );

      if (base64File) {
        const fileExtension = getFileExtensionByMimeType(base64File);

        const googleFile = await this.googleStorageService.uploadFileFromBase64(
          {
            bucketName: 'wepresto_bucket', // TODO: move to env
            base64: base64File,
            destinationPath: `${this.appConfiguration.environment}/payments/${existingPayment.uid}.${fileExtension}`,
          },
        );

        // make the file public
        await googleFile.makePublic();

        // update the movement with the file url
        const preloadedPayment = await this.movementRepository.preload({
          id: existingPayment.id,
          proofURL: `https://storage.googleapis.com/wepresto_bucket/${this.appConfiguration.environment}/payments/${existingPayment.uid}.${fileExtension}`,
        });

        await this.movementRepository.save(preloadedPayment);
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

  @RabbitRPC({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: `${RABBITMQ_EXCHANGE}.settle_late_payment_interest`,
    queue: `${RABBITMQ_EXCHANGE}.${MovementConsumerService.name}.settle_late_payment_interest`,
  })
  public async settleLatePaymentInterestConsumer(input: any) {
    const eventMessage = await this.eventMessageService.create({
      routingKey: `${RABBITMQ_EXCHANGE}.settle_late_payment_interest`,
      functionName: 'settleLatePaymentInterestConsumer',
      data: input,
    });

    try {
      const { timeZone } = input;

      Logger.log(
        `settleLatePaymentInterest: getting all loans that are disbursed`,
        MovementConsumerService.name,
      );

      // get all loans that are disbursed
      const existingLoans = await this.loanService.readService.getMany({
        status: LoanStatus.DISBURSED,
      });

      const referenceDate = getReferenceDate(new Date(), timeZone);

      Logger.log(
        `settleLatePaymentInterest: referenceDate: ${referenceDate}`,
        MovementConsumerService.name,
      );

      // for each loan that is disbursed look for the minimum amount to pay
      // and get the movements
      for (const existingLoan of existingLoans) {
        Logger.log(
          `settleLatePaymentInterest: processing loan ${existingLoan.uid}`,
          MovementConsumerService.name,
        );

        // get the minimum amount to pay
        const { movements } =
          await this.loanService.readService.getMinimumPaymentAmount({
            uid: existingLoan.uid,
            referenceDate,
          });

        // if there are no movements, continue
        if (!movements.length) {
          Logger.log(
            `settleLatePaymentInterest: there are no movements to pay for the loan ${existingLoan.uid}`,
            MovementConsumerService.name,
          );
          continue;
        }

        // getting the overdue interest movements to save as new movements in the DB
        const overdueInterestMovementsToSave = movements.reduce(
          (overdueInterestMovements, currentMovement, _i, selfArray) => {
            let newOverdueInterestMovements: Movement[] = [];

            // only check for the loan installments
            if (currentMovement.type === MovementType.LOAN_INSTALLMENT) {
              const { dueDate } = currentMovement;

              // get the reference date of the due date
              const referenceDueDate = getReferenceDate(dueDate, timeZone);

              // check if the installment is overdue
              if (referenceDueDate < referenceDate) {
                // get the number of days that the installment is overdue
                const daysOverdue = getNumberOfDays(
                  referenceDueDate,
                  referenceDate,
                );

                Logger.log(
                  `settleLatePaymentInterest: the installment ${currentMovement.uid} is overdue for ${daysOverdue} days`,
                  MovementConsumerService.name,
                );

                // for each day that the installment is overdue, check if there is a overdue interest movement
                for (let index = 1; index <= daysOverdue; index++) {
                  const possibleDate = addDays(dueDate, index);

                  // find a overdue interest movement for the possible date
                  const existingOverdue = selfArray.find(
                    (movement) =>
                      movement.type === MovementType.OVERDUE_INTEREST &&
                      isSameDay(movement.dueDate, possibleDate),
                  );

                  // if there is no overdue interest movement for the possible date and
                  // the possible date is less than or equal to the reference date
                  // then create a new overdue interest movement
                  if (!existingOverdue && possibleDate <= referenceDate) {
                    // eslint-disable-next-line prettier/prettier
                    const amount = (currentMovement.principal * existingLoan.annualInterestOverdueRate) / 360;

                    const newOverdueInterestMovement =
                      this.movementRepository.create({
                        amount,
                        dueDate: possibleDate,
                        loan: existingLoan,
                        type: MovementType.OVERDUE_INTEREST,
                        paid: false,
                      });

                    newOverdueInterestMovements = [
                      ...newOverdueInterestMovements,
                      newOverdueInterestMovement,
                    ];
                  }
                }
              } else {
                Logger.log(
                  `settleLatePaymentInterest: the installment ${currentMovement.uid} is not overdue`,
                  MovementConsumerService.name,
                );
              }
            }

            return [
              ...overdueInterestMovements,
              ...newOverdueInterestMovements,
            ];
          },
          [] as Movement[],
        );

        // save the new overdue interest movements
        await this.movementRepository.save(overdueInterestMovementsToSave);

        Logger.log(
          `settleLatePaymentInterest: the overdue interest movements were saved for loan ${existingLoan.uid}`,
          MovementConsumerService.name,
        );
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
