import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import appConfig from './config/app.config';
import appSchema from './config/app.schema';
import ormConfig from './config/orm.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonModule } from './common/common.module';

import { RedisCacheModule } from './plugins/redis-cache/redis-cache.module';
import { RabbitMQLocalModule } from './plugins/rabbit-local/rabbit-mq-local.module';
import { GoogleStorageModule } from './plugins/google-storage/google-storage.module';
import { WeprestoSlackModule } from './plugins/wepresto-slack/wepresto-slack.module';

import { UserModule } from './domains/users/user/user.module';
import { BorrowerModule } from './domains/users/borrower/borrower.module';
import { LenderModule } from './domains/users/lender/lender.module';

import { LoanModule } from './domains/loans/loan/loan.module';
import { MovementModule } from './domains/loans/movement/movement.module';
import { LoanParticipationModule } from './domains/loans/loan-participation/loan-participation.module';
import { FrenchAmortizationSystemModule } from './domains/loans/french-amortization-system/french-amortization-system.module';
import { NotificationModule } from './domains/notification/notification.module';
import { NequiModule } from './domains/payments/nequi/nequi.module';
import { PaymentAttemptModule } from './domains/payments/payment-attempt/payment-attempt.module';
import { WithdrawalModule } from './domains/loans/withdrawal/withdrawal.module';

@Module({
  imports: [
    // config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: appSchema,
    }),

    // TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          ...ormConfig,
          logging: configService.get<string>('config.database.log') === 'yes',
          timezone: 'Z',
        };
      },
    }),

    // Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>('config.mongoDB.uri'),
        };
      },
    }),

    // Redis cache
    RedisCacheModule,

    // RabbitMQ local module
    RabbitMQLocalModule,

    // Google storage
    GoogleStorageModule,

    // Cache
    /*
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      name: process.env.REDIS_CLIENT_NAME,
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      ttl: 1,
    }),
    */

    /*
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          isGlobal: true,
          store: redisStore,
          name: configService.get<string>('config.redis.clientName'),
          host: configService.get<string>('config.redis.host'),
          port: configService.get<number>('config.redis.port'),
          password: configService.get<string>('config.redis.password'),
          ttl: 60,
        };
      },
    }),
    */

    CommonModule,

    /* Users domain */

    UserModule,

    BorrowerModule,

    LenderModule,

    /* Users domain */

    /* Loans domain */

    LoanModule,

    MovementModule,

    LoanParticipationModule,

    FrenchAmortizationSystemModule,

    WeprestoSlackModule,

    NotificationModule,

    /* Loans domain */

    /* Payments domain */

    NequiModule,

    PaymentAttemptModule,

    WithdrawalModule,

    /* Payments domain */
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
