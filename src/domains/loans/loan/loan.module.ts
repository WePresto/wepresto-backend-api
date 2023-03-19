import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { Loan } from './loan.entity';

import { RabbitMQLocalModule } from '../../../plugins/rabbit-local/rabbit-mq-local.module';
import { EventMessageModule } from '../../event-message/event-message.module';
import { FrenchAmortizationSystemModule } from '../french-amortization-system/french-amortization-system.module';
import { BorrowerModule } from '../../users/borrower/borrower.module';

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
    EventMessageModule,
    FrenchAmortizationSystemModule,
    BorrowerModule,
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
