import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';

import appConfig from '../../config/app.config';

import { MailingModule } from '../../plugins/mailing/mailing.module';

@Module({
  imports: [ConfigModule.forFeature(appConfig), MailingModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
