import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasicAclModule } from 'nestjs-basic-acl-sdk';

import appConfig from '../../../config/app.config';

import { User } from './user.entity';

import { UserReadService } from './services/user.read.service';
import { UserCreateService } from './services/user.create.service';
import { UserUpdateService } from './services/user.update.service';
import { UserDeleteService } from './services/user.delete.service';
import { UserService } from './services/user.service';

import { UserController } from './user.controller';

import { FirebaseAdminModule } from '../../../plugins/firebase-admin/firebase-admin.module';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([User]),
    BasicAclModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          companyUid: configService.get<string>('config.acl.companyUid'),
          accessKey: configService.get<string>('config.acl.accessKey'),
        };
      },
    }),
    FirebaseAdminModule,
  ],
  providers: [
    UserReadService,
    UserCreateService,
    UserUpdateService,
    UserDeleteService,
    UserService,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
