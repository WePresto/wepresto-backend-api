import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Withdrawal, WithdrawalStatus } from '../withdrawal.entity';

import { LenderService } from '../../../users/lender/services/lender.service';

import { GetTotalWithdrawnInput } from '../dto/get-total-withdrawn-input.dto';
import { GetAvailableToWithdrawInput } from '../dto/get-available-to-withdraw-input.dto';
import { GetLenderWithdrawalsInput } from '../dto/get-lender-withdrawals-input.dto';

@Injectable()
export class WithdrawalReadService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly lenderService: LenderService,
  ) {}

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
        statuses: [
          WithdrawalStatus.REQUESTED,
          WithdrawalStatus.IN_PROGRESS,
          WithdrawalStatus.COMPLETED,
        ],
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
    const { lenderUid, take = '10', skip = '0' } = input;

    // get the lender
    const existingLender = await this.lenderService.readService.getOne({
      uid: lenderUid,
    });

    // get the withdrawals for the lender
    const [withdrawals, count] = await this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .innerJoin('withdrawal.lender', 'lender')
      .where('lender.id = :lenderId', { lenderId: existingLender.id })
      .orderBy('withdrawal.createdAt', 'DESC')
      .take(+take)
      .skip(+skip)
      .getManyAndCount();

    return {
      count,
      withdrawals,
    };
  }
}
