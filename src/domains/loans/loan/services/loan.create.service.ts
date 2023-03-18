import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan, LoanStatus } from '../loan.entity';

import { BorrowerService } from '../../../users/borrower/services/borrower.service';

import { ApplyLoanInput } from '../dto/apply-loan-input.dto';

@Injectable()
export class LoanCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly borrowerService: BorrowerService,
  ) {}

  public async apply(input: ApplyLoanInput) {
    const { borrowerUid, amount } = input;

    // get borrower
    const existingBorrower = await this.borrowerService.readService.getOne({
      uid: borrowerUid,
    });

    // create loan
    const createdLoan = this.loanRepository.create({
      borrower: existingBorrower,
      amount,
      status: LoanStatus.APPLIED,
    });

    const savedLoan = await this.loanRepository.save(createdLoan);

    return savedLoan;
  }
}
