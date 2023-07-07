import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseAdminService } from './firebase-admin.service';

import appConfig from '../../config/app.config';

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}
