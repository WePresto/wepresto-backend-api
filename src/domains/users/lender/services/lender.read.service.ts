import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Lender } from '../lender.entity';
import {
  Movement,
  MovementType,
} from '../../../loans/movement/movement.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneLenderInput } from '../dto/get-one-lender-input.dto';
import { GetParticipationsInput } from '../dto/get-participations-input.dto';
import { GetManyLendersInput } from '../dto/get-many-lenders-input.dto';

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

  private getParticipationRate(
    participationAmount: number,
    loanAmount: number,
  ) {
    return participationAmount / loanAmount;
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
        const totalCollected = loan.movements.reduce((pre, cur) => {
          const { type, processed, amount } = cur;

          if (type?.includes('PAYMENT') && processed) {
            return pre + Math.abs(amount);
          }

          return pre;
        }, 0);

        // get paid interest
        const paidInterest = loan.movements.reduce((pre, cur: Movement) => {
          const { type, amount, interest, paid } = cur;
          if (!paid) return pre;
          else if (type === MovementType.LOAN_INSTALLMENT)
            return pre + interest;
          else if (type === MovementType.OVERDUE_INTEREST) return pre + amount;

          return pre;
        }, 0);

        return {
          totalInvested: pre.totalInvested + amount,
          totalPrincipal:
            pre.totalPrincipal +
            totalCollected * participationRate -
            paidInterest * participationRate,
          totalInterest: pre.totalInterest + paidInterest * participationRate,
          totalCollected:
            pre.totalCollected + totalCollected * participationRate,
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
        const { type, interest, amount } = cur;

        if (type === MovementType.LOAN_INSTALLMENT) {
          return pre + interest;
        } else if (type === MovementType.OVERDUE_INTEREST) {
          return pre + amount;
        }

        return pre;
      }, 0);

      // get the total collected
      const totalCollected = loan.movements.reduce((pre, cur) => {
        const { type, processed, amount } = cur;

        if (type?.includes('PAYMENT') && processed) {
          return pre + Math.abs(amount);
        }

        return pre;
      }, 0);

      // get paid interest
      const paidInterest = loan.movements.reduce((pre, cur: Movement) => {
        const { type, amount, interest, paid } = cur;
        if (!paid) return pre;
        else if (type === MovementType.LOAN_INSTALLMENT) return pre + interest;
        else if (type === MovementType.OVERDUE_INTEREST) return pre + amount;

        return pre;
      }, 0);

      return {
        ...loanParticipation,
        participationRate,
        annualInterestParticipationRate:
          loan.annualInterestRate * participationRate,
        loan: {
          uid: loan.uid,
          consecutive: loan.consecutive,
          status: loan.status,
          amount: loan.amount,
          interest: interest * participationRate,
          term: loan.term,
          annualInterestRate: loan.annualInterestRate,
          annualInterestOverdueRate: loan.annualInterestOverdueRate,
          totalCollected: totalCollected * participationRate,
          paidInterest: paidInterest * participationRate,
          paidPrincipal:
            totalCollected * participationRate -
            paidInterest * participationRate,
        },
      };
    });

    return {
      count: participations.length,
      participations: participations.slice(+skip, +skip + +take),
    };
  }

  public async getMany(input: GetManyLendersInput) {
    const { fullName, documentNumber, take = '10', skip = '0' } = input;

    const query = this.lenderRepository
      .createQueryBuilder('lender')
      .innerJoinAndSelect('lender.user', 'user')
      .where('1 = 1')
      .take(+take)
      .skip(+skip);

    if (fullName) {
      query.andWhere('user.fullName ILIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }

    if (documentNumber) {
      query.andWhere('user.documentNumber ILIKE :documentNumber', {
        documentNumber: `%${documentNumber}%`,
      });
    }

    query.orderBy('user.createdAt', 'ASC');

    const [lenders, count] = await query.getManyAndCount();

    return {
      count,
      lenders,
    };
  }
}
