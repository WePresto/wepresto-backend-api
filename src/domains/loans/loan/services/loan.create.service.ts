import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { In, Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan, LoanStatus, InterstRate } from '../loan.entity';

import { validateAmountByCountry } from '../../../../utils/validate-amount-by-country';
import { getPlatformFeeByCountry } from 'src/utils/get-plaform-fee-by-country';

import { RabbitMQLocalService } from '../../../../plugins/rabbit-local/rabbit-mq-local.service';
import { FrenchAmortizationSystemService } from '../../french-amortization-system/french-amortization-system.service';
import { BorrowerService } from '../../../users/borrower/services/borrower.service';

import { ApplyLoanInput } from '../dto/apply-loan-input.dto';
import { SimulateLoanInput } from '../dto/simulate-loan-input.dto';

@Injectable()
export class LoanCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly rabbitMQLocalService: RabbitMQLocalService,
    private readonly frenchAmortizationSystemService: FrenchAmortizationSystemService,
    private readonly borrowerService: BorrowerService,
  ) {}

  public async apply(input: ApplyLoanInput) {
    const { borrowerUid, amount: requestedAmount, term, alias } = input;

    try {
      validateAmountByCountry('CO', requestedAmount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // validate term and amount
    this.validateTermAndAmount(term, requestedAmount);

    // get platform usage fee
    const platformUsageFee = getPlatformFeeByCountry('CO');

    // calculate total amount of the loan
    const amount = requestedAmount + platformUsageFee;

    // get borrower
    const existingBorrower = await this.borrowerService.readService.getOne({
      uid: borrowerUid,
    });

    // check if the borrower has an active application for a loan
    const activeLoanApplication = await this.loanRepository.findOne({
      where: {
        borrower: { id: existingBorrower.id },
        status: In([
          LoanStatus.APPLIED,
          LoanStatus.REVIEWING,
          LoanStatus.APPROVED,
        ]),
      },
    });

    if (activeLoanApplication) {
      throw new ConflictException('borrower has an active loan application');
    }

    // create loan
    const createdLoan = this.loanRepository.create({
      borrower: existingBorrower,
      amount,
      status: LoanStatus.APPLIED,
      alias,
      term,
      annualInterestRate: InterstRate[term],
      annualInterestOverdueRate: InterstRate[term] * 1.5, // TODO: this should be a config
      platformFee: platformUsageFee,
    });

    // save loan
    const savedLoan = await this.loanRepository.save(createdLoan);

    // publish loan application event
    await this.rabbitMQLocalService.publishLoanApplication({
      loanUid: savedLoan.uid,
    });

    return savedLoan;
  }

  private validateTermAndAmount(term: number, amount) {
    if (amount <= 500000 && term > 6) {
      throw new BadRequestException(
        'loan term must be less than or equal to 6 months',
      );
    } else if (amount > 500000 && amount <= 1000000 && term > 12) {
      throw new BadRequestException(
        'loan term must be less than or equal to 12 months',
      );
    } else if (amount > 1000000 && amount <= 2000000 && term > 18) {
      throw new BadRequestException(
        'loan term must be less than or equal to 18 months',
      );
    } else if (amount > 2000000 && amount <= 5000000 && term > 24) {
      throw new BadRequestException(
        'loan term must be less than or equal to 24 months',
      );
    } else if (amount > 10000000) {
      throw new BadRequestException('loan amount must be less than 10,000,000');
    }
  }

  public simulate(input: SimulateLoanInput) {
    const { alias, amount: requestedAmount, term } = input;

    // validate amount
    try {
      validateAmountByCountry('CO', requestedAmount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // validate term and amount
    this.validateTermAndAmount(term, requestedAmount);

    // get platform usage fee
    const platformUsageFee = getPlatformFeeByCountry('CO');

    // calculate total amount of the loan
    const amount = requestedAmount + platformUsageFee;

    const currentDate = new Date();

    const loanInstallments =
      this.frenchAmortizationSystemService.getLoanInstallments({
        amount,
        term,
        referenceDate: currentDate,
        annualInterestRate: InterstRate[term],
      });

    return {
      alias,
      requestedAmount,
      platformUsageFee,
      amount,
      term,
      referenceDate: currentDate.toISOString(),
      annualInterestRate: InterstRate[term],
      annualInterestOverdueRate: InterstRate[term] * 1.5,
      totalAmountToPay: loanInstallments.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      ),
      loanInstallments,
    };
  }

  public async sendEarlyPaymentNotifications() {
    await this.rabbitMQLocalService.publishSendEarlyPaymentNotifications();

    return { message: 'ok' };
  }

  public async sendLatePaymentNotifications() {
    await this.rabbitMQLocalService.publishSendLatePaymentNotifications();

    return { message: 'ok' };
  }
}
