import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Lender } from '../lender.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneLenderInput } from '../dto/get-one-lender-input.dto';
import { GetParticipationsInput } from '../dto/get-participations-input.dto';

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
      relations: ['user'],
      loadRelationIds: false,
    });

    return existingLender;
  }

  private getParticipationRate(
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
        const participationRate = this.getParticipationRate(
          amount,
          loan.amount,
        );

        // get the total collected
        const totalCollected =
          loan.movements.reduce((pre, cur) => {
            const { type, processed, amount } = cur;

            if (type?.includes('PAYMENT') && processed) {
              return pre + Math.abs(amount);
            }

            return pre;
          }, 0) * participationRate;

        // get paid interest
        const paidInterest =
          loan.movements.reduce((pre, cur) => {
            const { interest, paid } = cur;

            return pre + (paid ? interest : 0);
          }, 0) * participationRate;

        return {
          totalInvested: pre.totalInvested + amount,
          totalPrincipal: pre.totalPrincipal + (totalCollected - paidInterest),
          totalInterest: pre.totalInterest + paidInterest,
          totalCollected: pre.totalCollected + totalCollected,
        };
      },
      {
        totalInvested: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        totalCollected: 0,
      },
    );

    return resume;
  }

  public async getParticipations(input: GetParticipationsInput) {
    const { uid, startAmount, endAmount, take = '10', skip = '0' } = input;

    let parsedStartAmount: number | undefined;
    if (startAmount) {
      parsedStartAmount = +startAmount;
    }

    let parsedEndAmount: number | undefined;
    if (endAmount) {
      parsedEndAmount = +endAmount;
    }

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

    const query = await this.lenderRepository
      .createQueryBuilder('lender')
      .leftJoinAndSelect('lender.loanParticipations', 'loanParticipation')
      .leftJoinAndSelect('loanParticipation.loan', 'loan')
      .leftJoinAndSelect('loan.movements', 'movement')
      .where('lender.uid = :uid', { uid });

    if (parsedStartAmount) {
      query.andWhere('loanParticipation.amount >= :startAmount', {
        startAmount: parsedStartAmount,
      });
    }

    if (parsedEndAmount) {
      query.andWhere('loanParticipation.amount <= :endAmount', {
        endAmount: parsedEndAmount,
      });
    }

    const queryResult = await query.getOne();

    let loanParticipations = [];

    loanParticipations = queryResult?.loanParticipations || [];

    const participations = loanParticipations.map((loanParticipation) => {
      const { amount, loan } = loanParticipation;

      // get participation percentage based on loan amount and participation amount
      const participationRate = this.getParticipationRate(amount, loan.amount);

      // get interest
      const interest = loan.movements.reduce((pre, cur) => {
        const { interest } = cur;

        return pre + interest;
      }, 0);

      // get paid interest
      const paidInterest = loan.movements.reduce((pre, cur) => {
        const { interest, paid } = cur;

        return pre + (paid ? interest : 0);
      }, 0);

      // get paid principal
      const paidPrincipal = loan.movements.reduce((pre, cur) => {
        const { principal, paid } = cur;

        return pre + (paid ? principal : 0);
      }, 0);

      return {
        ...loanParticipation,
        participationRate,
        annualInterestParticipationRate:
          loan.annualInterestRate * participationRate,
        loan: {
          uid: loan.uid,
          amount: loan.amount,
          interest: interest * participationRate,
          term: loan.term,
          annualInterestRate: loan.annualInterestRate,
          annualInterestOverdueRate: loan.annualInterestOverdueRate,
          paidInterest: paidInterest * participationRate,
          paidPrincipal: paidPrincipal * participationRate,
        },
      };
    });

    return {
      count: participations.length,
      participations: participations.slice(+skip, +skip + +take),
    };
  }
}
