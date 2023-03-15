import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { Loan } from './loan.entity';

import { LoanService } from './services/loan.service';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([Loan]),
  ],
  providers: [LoanService],
})
export class LoanModule {}
