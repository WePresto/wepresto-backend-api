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

import { Withdrawal, WithdrawalStatus } from '../withdrawal.entity';

import { WithdrawalReadService } from './withdrawal.read.service';
import { WeprestoSlackService } from '../../../../plugins/wepresto-slack/wepresto-slack.service';
import { LenderService } from '../../../users/lender/services/lender.service';

import { getCommisionPercentageByCountry } from '../../../../utils/get-commision-percentage-by-country';

import { RequestWithdrawalInput } from '../dto/request-withdrawal-input.dto';

const MINIMUM_WITHDRAWAL_AMOUNT = 100000;

@Injectable()
export class WithdrawalCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly readService: WithdrawalReadService,
    private readonly weprestoSlackService: WeprestoSlackService,
    private readonly lenderService: LenderService,
  ) {}

  public async requestWithdrawal(input: RequestWithdrawalInput) {
    const { lenderUid, amount, bank, accountType, accountNumber } = input;

    // get the lender
    const existingLender = await this.lenderService.readService.getOneByFields({
      fields: {
        uid: lenderUid,
      },
      relations: ['user'],
    });

    // check if the amount is greater than the minimum
    if (amount < MINIMUM_WITHDRAWAL_AMOUNT) {
      throw new BadRequestException(
        `amount ${amount} is less than the minimum withdrawal amount`,
      );
    }

    // get the total available to withdraw
    const { availableToWithdraw } =
      await this.readService.getAvailableToWithdraw({
        lenderUid: existingLender.uid,
      });

    // check if the amount is available
    if (amount > availableToWithdraw) {
      throw new PreconditionFailedException(
        `amount ${amount} is not available`,
      );
    }

    // create the withdrawal
    const createdWithdrawal = await this.withdrawalRepository.create({
      amount,
      depositAmount: amount - amount * getCommisionPercentageByCountry('CO'),
      comissionAmount: amount * getCommisionPercentageByCountry('CO'),
      lender: existingLender,
      status: WithdrawalStatus.REQUESTED,
      accountInfo: {
        bank,
        accountType,
        accountNumber,
      },
    });

    // save the withdrawal
    const savedWithdrawal = await this.withdrawalRepository.save(
      createdWithdrawal,
    );

    // send the new withdrawal request message to slack
    await this.weprestoSlackService.sendNewWithdrawalRequestMessage({
      withdrawal: savedWithdrawal,
    });

    return savedWithdrawal;
  }
}
