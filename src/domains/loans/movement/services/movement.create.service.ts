import { ConflictException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Movement, MovementType } from '../movement.entity';

import { RabbitMQLocalService } from '../../../../plugins/rabbit-local/rabbit-mq-local.service';
import { LoanService } from '../../loan/services/loan.service';

import { getReferenceDate } from '../../../../utils';

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

    // check if the amout of the payment is greater than the total amount of the loan
    const { totalAmount: totalLoanAmount } =
      await this.loanService.readService.getTotalPaymentAmount({
        uid: existingLoan.uid,
        referenceDate: getReferenceDate(new Date()),
      });

    if (totalLoanAmount < +amount) {
      throw new ConflictException(
        `the amount of the payment is greater than the total payment amount of the loan`,
      );
    }

    // determine the type of the payment
    let typeToUse;
    if (+amount > minimumPaymentAmount && !type) {
      typeToUse = MovementType.PAYMENT_INSTALLMENT_AMOUNT_REDUCTION;
    } else if (+amount > minimumPaymentAmount && type) {
      typeToUse = type;
    } else {
      typeToUse = MovementType.PAYMENT;
    }

    // create the movement
    const createdMovement = this.movementRepository.create({
      loan: existingLoan,
      amount: +amount * -1,
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
