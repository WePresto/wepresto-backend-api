import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan, LoanStatus, InterstRate } from '../loan.entity';

import { FrenchAmortizationSystemService } from '../../french-amortization-system/french-amortization-system.service';
import { BorrowerService } from '../../../users/borrower/services/borrower.service';

import { ApplyLoanInput } from '../dto/apply-loan-input.dto';

@Injectable()
export class LoanCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly frenchAmortizationSystemService: FrenchAmortizationSystemService,
    private readonly borrowerService: BorrowerService,
  ) {}

  public async apply(input: ApplyLoanInput) {
    const { borrowerUid, amount, term, alias } = input;

    // validate term and amount
    this.validateTermAndAmount(term, amount);

    // get borrower
    const existingBorrower = await this.borrowerService.readService.getOne({
      uid: borrowerUid,
    });

    // create loan
    const createdLoan = this.loanRepository.create({
      borrower: existingBorrower,
      amount,
      status: LoanStatus.APPLIED,
      alias,
    });

    const savedLoan = await this.loanRepository.save(createdLoan);

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

  public simulate(input: ApplyLoanInput) {
    const { amount, term } = input;

    // validate term and amount
    this.validateTermAndAmount(term, amount);

    const currentDate = new Date();

    const loanInstallments =
      this.frenchAmortizationSystemService.getLoanInstallments({
        amount,
        term,
        referenceDate: currentDate,
        annualInterestRate: InterstRate[term],
      });

    return {
      amount,
      term,
      referenceDate: currentDate.toISOString(),
      annualInterestRate: InterstRate[term] * 100,
      annualInterestOverdueRate: InterstRate[term] * 100 * 1.5,
      totalAmountToPay: loanInstallments.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      ),
      loanInstallments,
    };
  }
}
