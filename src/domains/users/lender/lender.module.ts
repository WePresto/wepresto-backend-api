import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { LenderReadService } from './services/lender.read.service';
import { LenderService } from './services/lender.service';

import { Lender } from './lender.entity';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([Lender]),
  ],
  providers: [LenderReadService, LenderService],
  exports: [LenderService],
})
export class LenderModule {}
