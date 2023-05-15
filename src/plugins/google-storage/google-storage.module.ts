import { Module } from '@nestjs/common';
import { GoogleStorageService } from './google-storage.service';
import { ConfigModule } from '@nestjs/config';

import appConfig from '../../config/app.config';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [GoogleStorageService],
  exports: [GoogleStorageService],
})
export class GoogleStorageModule {}
