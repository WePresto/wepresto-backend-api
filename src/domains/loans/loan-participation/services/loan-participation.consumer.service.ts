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
import { LoanService } from '../../loan/services/loan.service';

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
    private readonly loanService: LoanService,
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
        .innerJoinAndSelect('lender.user', 'lenderUser')
        .innerJoinAndSelect('loan.borrower', 'borrower')
        .innerJoinAndSelect('borrower.user', 'borrowerUser')
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

      const { loan } = existingLoanParticipation;

      const { fundedAmount: loanFundedAmount } =
        await this.loanService.readService.getFundedAmount({
          uid: loan.uid,
        });

      const loanFundedPercentage = Math.round(
        (loanFundedAmount / loan.amount) * 100,
      );

      if (loanFundedPercentage > 99 && loanFundedPercentage <= 100) {
        const borrower = existingLoanParticipation?.loan?.borrower;

        Logger.log(
          `sending notification to borrower for loan ${loan.uid} fully funded`,
          LoanParticipationConsumerService.name +
            '.loanParticipationCreatedConsumer',
        );

        await this.notificationService.sendLoanFullyFundedNotification({
          borrowerEmail: borrower?.user?.email,
          borrowerPhoneNumber: `+57${borrower?.user?.phoneNumber}`,
          borrowerFirstName: borrower?.user?.fullName.split(' ')[0],
          loanConsecutive: loan?.consecutive,
        });
      }
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
