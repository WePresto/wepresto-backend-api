import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';

import appConfig from '../../../../config/app.config';

import { LoanParticipation } from '../loan-participation.entity';

import { LoanParticipationReadService } from './loan-participation.read.service';
import { EventMessageService } from '../../../event-message/event-message.service';
import { GoogleStorageService } from '../../../../plugins/google-storage/google-storage.service';

import { getRabbitMQExchangeName } from '../../../../utils';
import { getFileExtensionByMimeType } from '../../../../utils/get-file-extension.util';

const RABBITMQ_EXCHANGE = getRabbitMQExchangeName();

@Injectable()
export class LoanParticipationConsumerService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(LoanParticipation)
    private readonly loanParticipationRepository: Repository<LoanParticipation>,
    private readonly readService: LoanParticipationReadService,
    private readonly googleStorageService: GoogleStorageService,
    private readonly eventMessageService: EventMessageService,
  ) {}

  @RabbitRPC({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: `${RABBITMQ_EXCHANGE}.loan_participation_created`,
    queue: `${RABBITMQ_EXCHANGE}.${LoanParticipationConsumerService.name}.loan_participation_created`,
  })
  public async loanParticipationCreatedConsumer(input: any) {
    const eventMessage = await this.eventMessageService.create({
      routingKey: `${RABBITMQ_EXCHANGE}.loan_participation_created`,
      functionName: 'loanParticipationCreatedConsumer',
      data: input,
    });

    try {
      const { loanParticipationUid, base64File } = input;

      Logger.log(
        `loanParticipationCreatedConsumer: loan participation ${loanParticipationUid} received`,
        LoanParticipationConsumerService.name,
      );

      const existingLoanParticipation = await this.readService.getOneByFields({
        fields: { uid: loanParticipationUid },
        checkIfExists: true,
        loadRelationIds: false,
      });

      if (base64File) {
        const fileExtension = getFileExtensionByMimeType(base64File);

        const googleFile = await this.googleStorageService.uploadFileFromBase64(
          {
            bucketName: 'wepresto_bucket', // TODO: move to env
            base64: base64File,
            destinationPath: `${this.appConfiguration.environment}/loan-participations/${existingLoanParticipation.uid}.${fileExtension}`,
          },
        );

        // make the file public
        await googleFile.makePublic();

        // update the movement with the file url
        const preloadedWithdrawal =
          await this.loanParticipationRepository.preload({
            id: existingLoanParticipation.id,
            proofURL: `https://storage.googleapis.com/wepresto_bucket/${this.appConfiguration.environment}/loan-participations/${existingLoanParticipation.uid}.${fileExtension}`,
          });

        await this.loanParticipationRepository.save(preloadedWithdrawal);
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
