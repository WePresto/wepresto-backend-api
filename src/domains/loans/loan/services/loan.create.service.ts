import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan } from '../loan.entity';

import { BorrowerService } from '../../../users/borrower/services/borrower.service';
import { RabbitMQLocalService } from '../../../../plugins/rabbit-local/rabbit-mq-local.service';

import { CreateLoanInput } from '../dto/cretae-loan-input.dto';

@Injectable()
export class LoanCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly rabbitMQLocalService: RabbitMQLocalService,
    private readonly borrowerService: BorrowerService,
  ) {}

  public async create(input: CreateLoanInput) {
    const { borroweUid, amount, annualInterestRate, term, startDate } = input;

    const existingBorrower = await this.borrowerService.readService.getOne({
      uid: borroweUid,
    });

    const createdLoan = this.loanRepository.create({
      borrower: existingBorrower,
      amount,
      annualInterestRate,
      term,
      startDate,
      annualInterestOverdueRate: annualInterestRate * 1.5, // TODO: this should be a config
    });

    const savedLoan = await this.loanRepository.save(createdLoan);

    // publish loan created event
    await this.rabbitMQLocalService.publishLoanCreated({
      loanUid: savedLoan.uid,
    });

    return savedLoan;
  }
}
