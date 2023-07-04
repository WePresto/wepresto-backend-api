import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Withdrawal, WithdrawalStatus } from '../withdrawal.entity';

import { BaseService } from '../../../../common/base.service';
import { LenderService } from '../../../users/lender/services/lender.service';

import { GetTotalWithdrawnInput } from '../dto/get-total-withdrawn-input.dto';
import { GetAvailableToWithdrawInput } from '../dto/get-available-to-withdraw-input.dto';
import { GetLenderWithdrawalsInput } from '../dto/get-lender-withdrawals-input.dto';
import { GetOneWithdrawalInput } from '../dto/get-one-withdrawal-input.dto';

@Injectable()
export class WithdrawalReadService extends BaseService<Withdrawal> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly lenderService: LenderService,
  ) {
    super(withdrawalRepository);
  }

  public async getTotalWithdrawn(
    input: GetTotalWithdrawnInput,
  ): Promise<{ totalWithdrawn: number }> {
    const { lenderUid } = input;

    // get the lender
    const existingLender = await this.lenderService.readService.getOne({
      uid: lenderUid,
    });

    // get the total withdrawn for the lender
    const { totalWithdrawn = 0 } = await this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .select('COALESCE(SUM(withdrawal.amount), 0)', 'totalWithdrawn')
      .where('withdrawal.status IN (:...statuses)', {
        statuses: [WithdrawalStatus.REQUESTED, WithdrawalStatus.COMPLETED],
      })
      .andWhere('withdrawal.lender = :lenderId', {
        lenderId: existingLender.id,
      })
      .getRawOne();

    return {
      totalWithdrawn: Number(totalWithdrawn),
    };
  }

  public async getAvailableToWithdraw(
    input: GetAvailableToWithdrawInput,
  ): Promise<{ availableToWithdraw: number }> {
    const { lenderUid } = input;

    // get the lender
    const existingLender = await this.lenderService.readService.getOne({
      uid: lenderUid,
    });

    const [{ totalWithdrawn }, { totalPrincipal, totalInterest }] =
      await Promise.all([
        this.getTotalWithdrawn({ lenderUid: existingLender.uid }),
        this.lenderService.readService.getParticipationsResume({
          uid: existingLender.uid,
        }),
      ]);

    const totalAvailable = totalPrincipal + totalInterest - totalWithdrawn;

    return { availableToWithdraw: totalAvailable };
  }

  public async getLenderWithdrawals(input: GetLenderWithdrawalsInput) {
    const {
      lenderUid,
      startAmount,
      endAmount,
      take = '10',
      skip = '0',
    } = input;

    let parsedStartAmount: number | undefined;
    if (startAmount) {
      parsedStartAmount = +startAmount;
    }

    let parsedEndAmount: number | undefined;
    if (endAmount) {
      parsedEndAmount = +endAmount;
    }

    // get the lender
    const existingLender = await this.lenderService.readService.getOne({
      uid: lenderUid,
    });

    // get the withdrawals for the lender
    const query = this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .innerJoin('withdrawal.lender', 'lender')
      .where('lender.id = :lenderId', { lenderId: existingLender.id })
      .orderBy('withdrawal.createdAt', 'DESC')
      .take(+take)
      .skip(+skip);

    if (parsedStartAmount) {
      query.andWhere('withdrawal.amount >= :startAmount', {
        startAmount: parsedStartAmount,
      });
    }

    if (parsedEndAmount) {
      query.andWhere('withdrawal.amount <= :endAmount', {
        endAmount: parsedEndAmount,
      });
    }

    const [withdrawals, count] = await query.getManyAndCount();

    return {
      count,
      withdrawals,
    };
  }

  public async getOne(input: GetOneWithdrawalInput) {
    const { uid } = input;

    const withdrawal = await this.getOneByFields({
      fields: { uid },
      checkIfExists: true,
      loadRelationIds: false,
    });

    return withdrawal;
  }
}
