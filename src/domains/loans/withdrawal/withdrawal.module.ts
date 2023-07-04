import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { Withdrawal } from './withdrawal.entity';
import { WithdrawalController } from './withdrawal.controller';

import { WithdrawalCreateService } from './services/withdrawal.create.service';
import { WithdrawalReadService } from './services/withdrawal.read.service';
import { WithdrawalUpdateService } from './services/withdrawal.update.service';
import { WithdrawalConsumerService } from './services/withdrawal.consumer.service';
import { WithdrawalService } from './services/withdrawal.service';

import { WeprestoSlackModule } from '../../../plugins/wepresto-slack/wepresto-slack.module';
import { RabbitMQLocalModule } from '../../../plugins/rabbit-local/rabbit-mq-local.module';
import { GoogleStorageModule } from '../../../plugins/google-storage/google-storage.module';
import { EventMessageModule } from '../../event-message/event-message.module';
import { LenderModule } from '../../users/lender/lender.module';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([Withdrawal]),
    WeprestoSlackModule,
    RabbitMQLocalModule,
    GoogleStorageModule,
    EventMessageModule,
    LenderModule,
  ],
  providers: [
    WithdrawalCreateService,
    WithdrawalReadService,
    WithdrawalUpdateService,
    WithdrawalConsumerService,
    WithdrawalService,
  ],
  controllers: [WithdrawalController],
})
export class WithdrawalModule {}
