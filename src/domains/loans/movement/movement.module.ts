import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { Movement } from './movement.entity';

import { MovementConsumerService } from './services/movement.consumer.service';
import { MovementCreateService } from './services/movement.create.service';
import { MovementReadService } from './services/movement.read.service';
import { MovementService } from './services/movement.service';

import { MovementController } from './movement.controller';

import { RabbitMQLocalModule } from '../../../plugins/rabbit-local/rabbit-mq-local.module';
import { GoogleStorageModule } from '../../../plugins/google-storage/google-storage.module';
import { EventMessageModule } from '../../event-message/event-message.module';
import { LoanModule } from '../loan/loan.module';
import { FrenchAmortizationSystemModule } from '../french-amortization-system/french-amortization-system.module';
import { NotificationModule } from '../../notification/notification.module';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([Movement]),
    RabbitMQLocalModule,
    GoogleStorageModule,
    EventMessageModule,
    LoanModule,
    FrenchAmortizationSystemModule,
    NotificationModule,
  ],
  providers: [
    MovementConsumerService,
    MovementCreateService,
    MovementReadService,
    MovementService,
  ],
  controllers: [MovementController],
})
export class MovementModule {}
