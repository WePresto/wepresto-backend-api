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
import { NotificationService } from '../../../notification/notification.service';

import { getRabbitMQExchangeName, formatCurrency } from '../../../../utils';
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
    private readonly notificationService: NotificationService,
  ) {}

  @RabbitRPC({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: `${RABBITMQ_EXCHANGE}.loan_participation_created`,
    queue: `${RABBITMQ_EXCHANGE}.${LoanParticipationConsumerService.name}.loan_participation_created`,
  })
  public async loanParticipationCreatedConsumer(input: any) {
    const {
      app: { selftWebUrl },
    } = this.appConfiguration;

    const eventMessage = await this.eventMessageService.create({
      routingKey: `${RABBITMQ_EXCHANGE}.loan_participation_created`,
      functionName: 'loanParticipationCreatedConsumer',
      data: input,
    });

    try {
      const { loanParticipationUid, base64File } = input;

      Logger.log(
        `loan participation ${loanParticipationUid} received`,
        LoanParticipationConsumerService.name +
          '.loanParticipationCreatedConsumer',
      );

      const existingLoanParticipation = await this.loanParticipationRepository
        .createQueryBuilder('loanParticipation')
        .innerJoinAndSelect('loanParticipation.loan', 'loan')
        .innerJoinAndSelect('loanParticipation.lender', 'lender')
        .innerJoinAndSelect('lender.user', 'user')
        .where('loanParticipation.uid = :loanParticipationUid', {
          loanParticipationUid,
        })
        .getOne();

      if (base64File) {
        Logger.log(
          `uploading file for loan participation ${loanParticipationUid}`,
          LoanParticipationConsumerService.name +
            '.loanParticipationCreatedConsumer',
        );
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
        const preloadedLoanParticipation =
          await this.loanParticipationRepository.preload({
            id: existingLoanParticipation.id,
            proofURL: `https://storage.googleapis.com/wepresto_bucket/${this.appConfiguration.environment}/loan-participations/${existingLoanParticipation.uid}.${fileExtension}`,
          });

        await this.loanParticipationRepository.save(preloadedLoanParticipation);
      }

      Logger.log(
        `sending notification to lender for loan participation ${loanParticipationUid}`,
        LoanParticipationConsumerService.name +
          '.loanParticipationCreatedConsumer',
      );

      // send the notification to the lender
      await this.notificationService.sendLoanParticipationReceivedNotification({
        lenderEmail: existingLoanParticipation?.lender?.user?.email,
        lenderPhoneNumber: `+57${existingLoanParticipation?.lender?.user.phoneNumber}`,
        lenderFirstName:
          existingLoanParticipation?.lender?.user?.fullName.split(' ')[0],
        loanUid: existingLoanParticipation?.loan?.uid,
        loanParticipationAmount: formatCurrency(
          existingLoanParticipation.amount,
        ),
        link: `${selftWebUrl}/lender/investments`,
      });
    } catch (error) {
      console.error(error);

      const message = error.message;

      this.eventMessageService
        .setError({
          id: eventMessage._id,
          error,
        })
        .catch((error) => {
          console.error(error);
        });

      return {
        status: error.status || 500,
        message,
        data: {},
      };
    }
  }
}
