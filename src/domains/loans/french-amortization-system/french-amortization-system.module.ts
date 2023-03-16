import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from '../../../config/app.config';

import { FrenchAmortizationSystemService } from './french-amortization-system.service';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [FrenchAmortizationSystemService],
  exports: [FrenchAmortizationSystemService],
})
export class FrenchAmortizationSystemModule {}
