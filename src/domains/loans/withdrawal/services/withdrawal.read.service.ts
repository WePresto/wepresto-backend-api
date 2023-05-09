import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Withdrawal, WithdrawalStatus } from '../withdrawal.entity';

import { LenderService } from '../../../users/lender/services/lender.service';

import { GetTotalWithdrawnInput } from '../dto/get-total-withdrawn-input.dto';
import { GetAvailableToWithdrawInput } from '../dto/get-available-to-withdraw-input.dto';

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
      .select('SUM(withdrawal.amount)', 'totalWithdrawn')
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
      totalWithdrawn,
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
}
