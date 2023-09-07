import {
  BadRequestException,
  Inject,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { LoanParticipation } from '../loan-participation.entity';

import { validateAmountByCountry } from '../../../../utils/validate-amount-by-country';

import { RabbitMQLocalService } from '../../../../plugins/rabbit-local/rabbit-mq-local.service';
import { LoanService } from '../../loan/services/loan.service';
import { LenderService } from '../../../users/lender/services/lender.service';

import { CreateLoanParticipationInput } from '../dto/create-loan-participation-input.dto';

@Injectable()
export class LoanParticipationCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(LoanParticipation)
    private readonly loanParticipationRepository: Repository<LoanParticipation>,
    private readonly rabbitMQLocalService: RabbitMQLocalService,
    private readonly loanService: LoanService,
    private readonly lenderService: LenderService,
  ) {}

  public async create(input: CreateLoanParticipationInput) {
    const { loanUid, lenderUid, amount, file } = input;

    const newParticipationAmount =
      typeof amount === 'string' ? parseInt(amount) : amount;

    try {
      validateAmountByCountry('CO', newParticipationAmount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // get loan
    const existingLoan = await this.loanService.readService.getOne({
      uid: loanUid,
    });

    const base64File = file ? file.buffer.toString('base64') : undefined;

    // check the participation amount vs the loan amount
    if (newParticipationAmount > existingLoan.amount) {
      throw new PreconditionFailedException(
        'participation amount cannot be greater than loan amount',
      );
    }

    // get the loan participations
    const existingLoanParticipations =
      await this.loanParticipationRepository.find({
        where: {
          loan: { id: existingLoan.id },
        },
        relations: ['lender'],
      });

    const totalParticipationAmount = existingLoanParticipations.reduce(
      (total, loanParticipation) => {
        return total + loanParticipation.amount;
      },
      0,
    );

    // check the total participation amount vs the loan amount
    if (
      totalParticipationAmount + newParticipationAmount >
      existingLoan.amount
    ) {
      throw new PreconditionFailedException(
        'total participation amount cannot be greater than loan amount, the loan is already fully funded',
      );
    }

    // get lender
    const existingLender = await this.lenderService.readService.getOne({
      uid: lenderUid,
    });

    // check if the lender has already participated in the loan
    const existingLoanParticipation = existingLoanParticipations.find(
      (loanParticipation) => {
        return loanParticipation.lender.id === existingLender.id;
      },
    );

    if (existingLoanParticipation) {
      throw new PreconditionFailedException(
        'lender has already participated in the loan',
      );
    }

    const createLoanParticipation = this.loanParticipationRepository.create({
      loan: existingLoan,
      lender: existingLender,
      amount: newParticipationAmount,
    });

    const savedLoanParticipation = await this.loanParticipationRepository.save(
      createLoanParticipation,
    );

    // publish the withdrawal completed event
    await this.rabbitMQLocalService.publishLoanParticipationCreated({
      loanParticipationUid: savedLoanParticipation.uid,
      base64File: base64File,
    });

    return savedLoanParticipation;
  }
}
