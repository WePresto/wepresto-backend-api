import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AwsSnsService } from './aws-sns.service';

import appConfig from '../../config/app.config';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [AwsSnsService],
  exports: [AwsSnsService],
})
export class AwsSnsModule {}
