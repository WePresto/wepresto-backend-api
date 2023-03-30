import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { WeprestoSlackService } from './wepresto-slack.service';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [WeprestoSlackService],
  exports: [WeprestoSlackService],
})
export class WeprestoSlackModule {}
