import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentAttempt } from './payment-attempt.entity';

import appConfig from '../../../config/app.config';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([PaymentAttempt]),
  ],
})
export class PaymentAttemptModule {}
