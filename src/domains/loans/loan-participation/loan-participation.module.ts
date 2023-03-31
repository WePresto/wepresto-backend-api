import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { LoanParticipation } from './loan-participation.entity';

import { LoanParticipationController } from './loan-participation.controller';

import { LoanParticipationCreateService } from './services/loan-participation.create.service';
import { LoanParticipationService } from './services/loan-participation.service';

import { LoanModule } from '../loan/loan.module';
import { LenderModule } from '../../users/lender/lender.module';
@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([LoanParticipation]),
    LoanModule,
    LenderModule,
  ],
  providers: [LoanParticipationCreateService, LoanParticipationService],
  controllers: [LoanParticipationController],
  exports: [LoanParticipationService],
})
export class LoanParticipationModule {}
