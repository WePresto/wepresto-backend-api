import { ConflictException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Movement, MovementType } from '../movement.entity';

import { RabbitMQLocalService } from '../../../../plugins/rabbit-local/rabbit-mq-local.service';
import { LoanService } from '../../loan/services/loan.service';

import { getReferenceDate } from '../../../../utils';
import { getAmountToForgive } from '../../../../utils/get-amount-to-forgive.util';

import { CreatePaymentMovementInput } from '../dto/create-payment-movement-input.dto';

export class MovementCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
    private readonly rabbitMQLocalService: RabbitMQLocalService,
    private readonly loanService: LoanService,
  ) {}

  public async createPayment(
    input: CreatePaymentMovementInput,
  ): Promise<Movement> {
    const { loanUid, amount, paymentDate, type, file } = input;

    const base64File = file ? file.buffer.toString('base64') : undefined;

    // get the loan
    const existingLoan = await this.loanService.readService.getOne({
      uid: loanUid,
    });

    // check if the amount of the payment is greater than the amount to pay
    const { totalAmount: minimumPaymentAmount } =
      await this.loanService.readService.getMinimumPaymentAmount({
        uid: existingLoan.uid,
        referenceDate: getReferenceDate(new Date()),
      });

    if (minimumPaymentAmount > +amount) {
      throw new ConflictException(
        `the amount of the payment is less than the minimum payment amount`,
      );
    }

    // validate the type of the payment in relation with the minimumPaymentAmount,
    // the amount of the payment
    if (type) {
      if (
        type === MovementType.PAYMENT_INSTALLMENT_AMOUNT_REDUCTION &&
        +amount <= minimumPaymentAmount
      ) {
        throw new ConflictException(
          `the amount of the payment needs to be greater than the minimum payment amount, so you payment can reduce the installment amount`,
        );
      } else if (
        type === MovementType.PAYMENT_TERM_REDUCTION &&
        +amount <= minimumPaymentAmount
      ) {
        throw new ConflictException(
          `the amount of the payment needs to be greater than the minimum payment amount, so you payment can reduce the number of installments`,
        );
      } else if (
        type === MovementType.PAYMENT &&
        +amount > minimumPaymentAmount
      ) {
        throw new ConflictException(
          `the amount of the payment needs to be equal to the minimum payment amount, as the type of the payment is ${MovementType.PAYMENT}`,
        );
      }
    }

    // check if the amout of the payment is greater than the total amount of the loan
    const { totalAmount: totalLoanAmount } =
      await this.loanService.readService.getTotalPaymentAmount({
        uid: existingLoan.uid,
        referenceDate: getReferenceDate(new Date()),
      });

    if (
      totalLoanAmount < +amount &&
      +amount - totalLoanAmount > getAmountToForgive('CO')
    ) {
      throw new ConflictException(
        `the amount of the payment is greater than the total payment amount of the loan`,
      );
    }

    // determine the type of the payment
    // if the type is not provided
    let typeToUse = type;
    if (!typeToUse) {
      if (+amount === minimumPaymentAmount) {
        typeToUse = MovementType.PAYMENT;
      } else if (+amount > minimumPaymentAmount) {
        typeToUse = MovementType.PAYMENT_INSTALLMENT_AMOUNT_REDUCTION;
      }
    }

    const isTheLastPayment = totalLoanAmount - +amount <= 0;

    // create the movement
    const createdMovement = this.movementRepository.create({
      loan: existingLoan,
      amount: isTheLastPayment ? totalLoanAmount * -1 : +amount * -1,
      movementDate: paymentDate,
      type: typeToUse,
      processed: false,
    });

    const savedMovement = await this.movementRepository.save(createdMovement);

    // publish payment created event
    await this.rabbitMQLocalService.publishPaymentCreated({
      movementUid: savedMovement.uid,
      base64File,
    });

    return savedMovement;
  }

  public async createLatePaymentInterest() {
    await this.rabbitMQLocalService.publishSettleLatePaymentInterest({
      timeZone: 'America/Bogota',
    });

    return { message: 'ok' };
  }
}
