import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Lender } from '../lender.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneLenderInput } from '../dto/get-one-lender-input.dto';

@Injectable()
export class LenderReadService extends BaseService<Lender> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Lender)
    private readonly lenderRepository: Repository<Lender>,
  ) {
    super(lenderRepository);
  }

  public async getOne(input: GetOneLenderInput): Promise<Lender> {
    const { uid } = input;

    const existingLender = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    return existingLender;
  }

  private getParticipationPercentage(
    participationAmount: number,
    loanAmount: number,
  ) {
    return participationAmount / loanAmount;
  }

  public async getParticipationsResume(input: GetOneLenderInput) {
    const { uid } = input;

    const existingLender = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    if (!existingLender) {
      throw new BadRequestException('Lender not found');
    }

    const queryResult = await this.lenderRepository
      .createQueryBuilder('lender')
      .leftJoinAndSelect('lender.loanParticipations', 'loanParticipation')
      .leftJoinAndSelect('loanParticipation.loan', 'loan')
      .leftJoinAndSelect('loan.movements', 'movement')
      .where('lender.uid = :uid', { uid })
      .getOne();

    let loanParticipations = [];

    loanParticipations = queryResult?.loanParticipations || [];

    const resume = loanParticipations.reduce(
      (pre, cur) => {
        const { amount, loan } = cur;

        // get participation percentage based on loan amount and participation amount
        const participationPercentage = this.getParticipationPercentage(
          amount,
          loan.amount,
        );

        // get paid interest
        const paidInterest = loan.movements.reduce((pre, cur) => {
          const { interest, paid } = cur;

          return pre + (paid ? interest : 0);
        }, 0);

        return {
          totalInvested: pre.totalInvested + amount,
          totalInterest:
            pre.totalInterest + paidInterest * participationPercentage,
        };
      },
      {
        totalInvested: 0,
        totalInterest: 0,
      },
    );

    return resume;
  }

  public async getParticipations(input: GetOneLenderInput) {
    const { uid } = input;

    const existingLender = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    if (!existingLender) {
      throw new BadRequestException('Lender not found');
    }

    const queryResult = await this.lenderRepository
      .createQueryBuilder('lender')
      .leftJoinAndSelect('lender.loanParticipations', 'loanParticipation')
      .leftJoinAndSelect('loanParticipation.loan', 'loan')
      .leftJoinAndSelect('loan.movements', 'movement')
      .where('lender.uid = :uid', { uid })
      .getOne();

    let loanParticipations = [];

    loanParticipations = queryResult?.loanParticipations || [];

    const participations = loanParticipations.map((loanParticipation) => {
      const { amount, loan } = loanParticipation;

      // get participation percentage based on loan amount and participation amount
      const participationPercentage = this.getParticipationPercentage(
        amount,
        loan.amount,
      );

      // get paid interest
      const paidInterest = loan.movements.reduce((pre, cur) => {
        const { interest, paid } = cur;

        return pre + (paid ? interest : 0);
      }, 0);

      return {
        ...loanParticipation,
        participationPercentage,
        loan: {
          amount: loan.amount,
          interest: loan.interest,
          term: loan.term,
          annualInterestRate: loan.annualInterestRate,
          annualInterestOverdueRate: loan.annualInterestOverdueRate,
          paidInterest: paidInterest * participationPercentage,
        },
      };
    });

    return participations;
  }
}
