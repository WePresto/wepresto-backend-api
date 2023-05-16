import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan, LoanStatus } from '../loan.entity';

import { LoanReadService } from './loan.read.service';

import { RabbitMQLocalService } from '../../../../plugins/rabbit-local/rabbit-mq-local.service';

import { getReferenceDate } from '../../../../utils';

import { ReviewLoanInput } from '../dto/review-loan-input.dto';
import { RejectLoanInput } from '../dto/reject-loan-input.dto';
import { ApproveLoanInput } from '../dto/approve-loan-input.dto';
import { DisburseLoanInput } from '../dto/disburse-loan-input.dto';

@Injectable()
export class LoanUpdateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly readService: LoanReadService,
    private readonly rabbitMQLocalService: RabbitMQLocalService,
  ) {}

  public async review(input: ReviewLoanInput) {
    const { uid, comment } = input;

    // get loan
    const existingLoan = await this.readService.getOne({ uid });

    // check loan status
    if (existingLoan.status !== LoanStatus.APPLIED) {
      throw new ConflictException(
        `loan is not in ${LoanStatus.APPLIED} status`,
      );
    }

    // update loan
    const preloadedLoan = await this.loanRepository.preload({
      id: existingLoan.id,
      status: LoanStatus.REVIEWING,
      comment,
    });

    const savedLoan = await this.loanRepository.save(preloadedLoan);

    return savedLoan;
  }

  public async reject(input: RejectLoanInput) {
    const { uid, comment } = input;

    // get loan
    const existingLoan = await this.readService.getOne({ uid });

    // check loan status
    if (existingLoan.status !== LoanStatus.REVIEWING) {
      throw new ConflictException(
        `loan is not in ${LoanStatus.REVIEWING} status`,
      );
    }

    // update loan
    const preloadedLoan = await this.loanRepository.preload({
      id: existingLoan.id,
      status: LoanStatus.REJECTED,
      comment,
    });

    const savedLoan = await this.loanRepository.save(preloadedLoan);

    return savedLoan;
  }

  public async approve(input: ApproveLoanInput) {
    const { uid, comment } = input;

    // get loan
    const existingLoan = await this.readService.getOne({ uid });

    // check loan status
    if (existingLoan.status !== LoanStatus.REVIEWING) {
      throw new ConflictException(
        `loan is not in ${LoanStatus.REVIEWING} status`,
      );
    }

    // update loan
    const preloadedLoan = await this.loanRepository.preload({
      id: existingLoan.id,
      status: LoanStatus.APPROVED,
      comment,
    });

    const savedLoan = await this.loanRepository.save(preloadedLoan);

    return savedLoan;
  }

  public async disburse(input: DisburseLoanInput) {
    const { uid, comment, disbursementDate } = input;

    // get loan
    const existingLoan = await this.readService.getOne({ uid });

    // check loan status
    if (existingLoan.status !== LoanStatus.APPROVED) {
      throw new ConflictException(
        `loan is not in ${LoanStatus.APPROVED} status`,
      );
    }

    // update loan
    const preloadedLoan = await this.loanRepository.preload({
      id: existingLoan.id,
      startDate: disbursementDate
        ? new Date(disbursementDate)
        : getReferenceDate(new Date()),
      status: LoanStatus.DISBURSED,
      comment,
    });

    const savedLoan = await this.loanRepository.save(preloadedLoan);

    // publish loan disbursement event
    await this.rabbitMQLocalService.publishLoanDisbursement({
      loanUid: savedLoan.uid,
    });

    return savedLoan;
  }
}
