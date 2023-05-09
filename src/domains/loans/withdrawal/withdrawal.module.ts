import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../../../config/app.config';

import { Withdrawal } from './withdrawal.entity';
import { WithdrawalController } from './withdrawal.controller';

import { WithdrawalCreateService } from './services/withdrawal.create.service';
import { WithdrawalReadService } from './services/withdrawal.read.service';
import { WithdrawalService } from './services/withdrawal.service';

import { WeprestoSlackModule } from '../../../plugins/wepresto-slack/wepresto-slack.module';
import { LenderModule } from '../../users/lender/lender.module';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([Withdrawal]),
    WeprestoSlackModule,
    LenderModule,
  ],
  providers: [
    WithdrawalCreateService,
    WithdrawalReadService,
    WithdrawalService,
  ],
  controllers: [WithdrawalController],
})
export class WithdrawalModule {}
