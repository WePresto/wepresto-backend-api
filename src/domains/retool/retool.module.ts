import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { RetoolService } from './retool.service';
import { RetoolController } from './retool.controller';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [RetoolService],
  controllers: [RetoolController],
})
export class RetoolModule {}
