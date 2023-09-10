import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import appConfig from '../../../../config/app.config';

import { Withdrawal, WithdrawalStatus } from '../withdrawal.entity';

import { WithdrawalReadService } from './withdrawal.read.service';
import { RabbitMQLocalService } from '../../../../plugins/rabbit-local/rabbit-mq-local.service';

import { CompleteWithdrawalInput } from '../dto/complete-withdrawal-input.dto';

@Injectable()
export class WithdrawalUpdateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly readService: WithdrawalReadService,
    private readonly rabbitMQLocalService: RabbitMQLocalService,
  ) {}

  public async complete(input: CompleteWithdrawalInput) {
    const { uid, file } = input;

    // get the withdrawal
    const existingWithdrawal = await this.readService.getOneByFields({
      fields: { uid },
      checkIfExists: true,
      loadRelationIds: false,
    });

    // check the withdrawal status
    if (existingWithdrawal.status !== WithdrawalStatus.REQUESTED) {
      throw new ConflictException(
        `withdrawal is not in ${WithdrawalStatus.REQUESTED} status`,
      );
    }

    const base64File = file ? file.buffer.toString('base64') : undefined;

    // update the withdrawal
    const preloadedWithdrawal = await this.withdrawalRepository.preload({
      id: existingWithdrawal.id,
      status: WithdrawalStatus.COMPLETED,
    });

    const savedWithdrawal =
      await this.withdrawalRepository.save(preloadedWithdrawal);

    // publish the withdrawal completed event
    await this.rabbitMQLocalService.publishWithdrawalCompleted({
      withdrawalUid: savedWithdrawal.uid,
      base64File: base64File,
    });

    return savedWithdrawal;
  }
}
