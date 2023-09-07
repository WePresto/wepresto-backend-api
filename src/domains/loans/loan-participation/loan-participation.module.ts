import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { LoanParticipation } from './loan-participation.entity';

import { LoanParticipationController } from './loan-participation.controller';

import { LoanParticipationCreateService } from './services/loan-participation.create.service';
import { LoanParticipationReadService } from './services/loan-participation.read.service';
import { LoanParticipationConsumerService } from './services/loan-participation.consumer.service';
import { LoanParticipationService } from './services/loan-participation.service';

import { RabbitMQLocalModule } from '../../../plugins/rabbit-local/rabbit-mq-local.module';
import { GoogleStorageModule } from '../../../plugins/google-storage/google-storage.module';
import { EventMessageModule } from '../../event-message/event-message.module';
import { LoanModule } from '../loan/loan.module';
import { LenderModule } from '../../users/lender/lender.module';
import { NotificationModule } from '../../notification/notification.module';
@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([LoanParticipation]),
    RabbitMQLocalModule,
    GoogleStorageModule,
    EventMessageModule,
    LoanModule,
    LenderModule,
    NotificationModule,
  ],
  providers: [
    LoanParticipationCreateService,
    LoanParticipationReadService,
    LoanParticipationConsumerService,
    LoanParticipationService,
  ],
  controllers: [LoanParticipationController],
  exports: [LoanParticipationService],
})
export class LoanParticipationModule {}
