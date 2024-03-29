import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { Loan } from './loan.entity';

import { RabbitMQLocalModule } from '../../../plugins/rabbit-local/rabbit-mq-local.module';
import { WeprestoSlackModule } from '../../../plugins/wepresto-slack/wepresto-slack.module';
import { EventMessageModule } from '../../event-message/event-message.module';
import { NotificationModule } from '../../notification/notification.module';
import { FrenchAmortizationSystemModule } from '../french-amortization-system/french-amortization-system.module';
import { BorrowerModule } from '../../users/borrower/borrower.module';
import { LenderModule } from '../../users/lender/lender.module';

import { LoanConsumerService } from './services/loan.consumer.service';
import { LoanCreateService } from './services/loan.create.service';
import { LoanReadService } from './services/loan.read.service';
import { LoanUpdateService } from './services/loan.update.service';
import { LoanService } from './services/loan.service';

import { LoanController } from './loan.controller';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([Loan]),
    RabbitMQLocalModule,
    WeprestoSlackModule,
    EventMessageModule,
    NotificationModule,
    FrenchAmortizationSystemModule,
    BorrowerModule,
    LenderModule,
  ],
  providers: [
    LoanConsumerService,
    LoanCreateService,
    LoanReadService,
    LoanUpdateService,
    LoanService,
  ],
  controllers: [LoanController],
  exports: [LoanService],
})
export class LoanModule {}
