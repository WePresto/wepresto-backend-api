import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';

import appConfig from '../../../../config/app.config';

import { Withdrawal } from '../withdrawal.entity';

import { WithdrawalReadService } from './withdrawal.read.service';
import { EventMessageService } from '../../../event-message/event-message.service';
import { GoogleStorageService } from '../../../../plugins/google-storage/google-storage.service';

import { getRabbitMQExchangeName } from '../../../../utils';
import { getFileExtensionByMimeType } from '../../../../utils/get-file-extension.util';

const RABBITMQ_EXCHANGE = getRabbitMQExchangeName();

@Injectable()
export class WithdrawalConsumerService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    private readonly readService: WithdrawalReadService,
    private readonly googleStorageService: GoogleStorageService,
    private readonly eventMessageService: EventMessageService,
  ) {}

  @RabbitRPC({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: `${RABBITMQ_EXCHANGE}.withdrawal_completed`,
    queue: `${RABBITMQ_EXCHANGE}.${WithdrawalConsumerService.name}.withdrawal_completed`,
  })
  public async withdrawalCompletedConsumer(input: any) {
    const eventMessage = await this.eventMessageService.create({
      routingKey: `${RABBITMQ_EXCHANGE}.withdrawal_completed`,
      functionName: 'withdrawalCompletedConsumer',
      data: input,
    });

    try {
      const { withdrawalUid, base64File } = input;

      Logger.log(
        `withdrawalCompletedConsumer: withdrawal ${withdrawalUid} received`,
        WithdrawalConsumerService.name,
      );

      const existingWithdrawal = await this.readService.getOneByFields({
        fields: { uid: withdrawalUid },
        checkIfExists: true,
        loadRelationIds: false,
      });

      if (base64File) {
        const fileExtension = getFileExtensionByMimeType(base64File);

        const googleFile = await this.googleStorageService.uploadFileFromBase64(
          {
            bucketName: 'wepresto_bucket', // TODO: move to env
            base64: base64File,
            destinationPath: `${this.appConfiguration.environment}/withdrawals/${existingWithdrawal.uid}.${fileExtension}`,
          },
        );

        // make the file public
        await googleFile.makePublic();

        // update the movement with the file url
        const preloadedWithdrawal = await this.withdrawalRepository.preload({
          id: existingWithdrawal.id,
          proofURL: `https://storage.googleapis.com/wepresto_bucket/${this.appConfiguration.environment}/withdrawals/${existingWithdrawal.uid}.${fileExtension}`,
        });

        await this.withdrawalRepository.save(preloadedWithdrawal);
      }
    } catch (error) {
      console.error(error);

      const message = error.message;

      await this.eventMessageService.setError({
        id: eventMessage._id,
        error,
      });

      return {
        status: error.status || 500,
        message,
        data: {},
      };
    }
  }
}
