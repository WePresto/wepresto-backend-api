import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import appConfig from '../../../config/app.config';

import { NequiService } from './nequi.service';
import { NequiController } from './nequi.controller';

import { EventMessageModule } from '../../event-message/event-message.module';

@Module({
  imports: [ConfigModule.forFeature(appConfig), HttpModule, EventMessageModule],
  providers: [NequiService],
  controllers: [NequiController],
  exports: [NequiService],
})
export class NequiModule {}
