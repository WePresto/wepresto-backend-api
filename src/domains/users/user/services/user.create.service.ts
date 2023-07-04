import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasicAclService } from 'nestjs-basic-acl-sdk';

import appConfig from '../../../../config/app.config';

import { User } from '../user.entity';

import { UserReadService } from './user.read.service';

import { CreateBorrowerInput } from '../dto/create-borrower-input.dto';
import { CreateLenderInput } from '../dto/create-lender-input.dto';

@Injectable()
export class UserCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly readService: UserReadService,
    private readonly basicAclService: BasicAclService,
  ) {}

  public async createLender(input: CreateLenderInput) {
    console.log('input', input);

    const {
      documentType,
      documentNumber,
      email,
      password,
      phoneNumber,
      fullName,
      address,
      country,
      city,
    } = input;

    const {
      acl: {
        roles: { lenderCode },
      },
    } = this.appConfiguration;

    // check if the user already exists by document number
    const existingUserByDocumentNumber = await this.readService.getOneByFields({
      fields: {
        documentNumber,
      },
      loadRelationIds: false,
    });

    if (existingUserByDocumentNumber) {
      throw new ConflictException(
        `already exist an user with the document number ${documentNumber}.`,
      );
    }

    // check if the user already exists by email
    const exisingUserByEmail = await this.readService.getOneByFields({
      fields: {
        email,
      },
      loadRelationIds: false,
    });

    if (exisingUserByEmail) {
      throw new ConflictException(
        `already exist an user with the email ${email}.`,
      );
    }

    // check if the user already exists by email
    const exisingUserByPhoneNumber = await this.readService.getOneByFields({
      fields: {
        phoneNumber,
      },
      loadRelationIds: false,
    });

    if (exisingUserByPhoneNumber) {
      throw new ConflictException(
        `already exist an user with the phone number ${phoneNumber}.`,
      );
    }

    const aclUser = await this.basicAclService.createUser({
      email,
      password,
      phone: `+57${phoneNumber}`,
      roleCode: lenderCode,
      sendEmail: true,
      emailTemplateParams: {
        firstName: fullName.split(' ')[0],
      },
    });

    try {
      const { authUid } = aclUser;

      const createdUser = this.userRepository.create({
        documentType,
        authUid,
        documentNumber,
        fullName,
        email,
        phoneNumber,
        country,
        city,
        address,
      });

      const savedUser = await this.userRepository.save(createdUser);

      const preloaded = await this.userRepository.preload({
        id: savedUser.id,
        lender: {
          id: savedUser.id,
        },
      });

      await this.userRepository.save(preloaded);

      return savedUser;
    } catch (error) {
      Logger.warn('deleting the user in ACL', UserCreateService.name);

      await this.basicAclService.deleteUser({
        authUid: aclUser.authUid,
      });
    }
  }

  public async createBorrower(input: CreateBorrowerInput): Promise<User> {
    const {
      documentType,
      documentNumber,
      email,
      password,
      phoneNumber,
      fullName,
      country,
      city,
      address,
    } = input;

    const {
      acl: {
        roles: { borrowerCode },
      },
    } = this.appConfiguration;

    // check if the user already exists by document number
    const existingUserByDocumentNumber = await this.readService.getOneByFields({
      fields: {
        documentNumber,
      },
      loadRelationIds: false,
    });

    if (existingUserByDocumentNumber) {
      throw new ConflictException(
        `already exist an user with the document number ${documentNumber}.`,
      );
    }

    // check if the user already exists by email
    const exisingUserByEmail = await this.readService.getOneByFields({
      fields: {
        email,
      },
      loadRelationIds: false,
    });

    if (exisingUserByEmail) {
      throw new ConflictException(
        `already exist an user with the email ${email}.`,
      );
    }

    // check if the user already exists by email
    const exisingUserByPhoneNumber = await this.readService.getOneByFields({
      fields: {
        phoneNumber,
      },
      loadRelationIds: false,
    });

    if (exisingUserByPhoneNumber) {
      throw new ConflictException(
        `already exist an user with the phone number ${phoneNumber}.`,
      );
    }

    const aclUser = await this.basicAclService.createUser({
      email,
      password,
      phone: `+57${phoneNumber}`,
      roleCode: borrowerCode,
      sendEmail: true,
      emailTemplateParams: {
        fullName,
      },
    });

    try {
      const { authUid } = aclUser;

      const createdUser = this.userRepository.create({
        authUid,
        documentType,
        documentNumber,
        fullName,
        email,
        phoneNumber,
        country,
        city,
        address,
      });

      const savedUser = await this.userRepository.save(createdUser);

      const preloaded = await this.userRepository.preload({
        id: savedUser.id,
        borrower: {
          id: savedUser.id,
        },
      });

      await this.userRepository.save(preloaded);

      return savedUser;
    } catch (error) {
      Logger.warn('deleting the user in ACL', UserCreateService.name);

      await this.basicAclService.deleteUser({
        authUid: aclUser.authUid,
      });
    }
  }
}
