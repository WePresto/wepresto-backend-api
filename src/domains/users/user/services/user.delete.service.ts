import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { BasicAclService } from 'nestjs-basic-acl-sdk';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { User } from '../user.entity';

import { UserReadService } from './user.read.service';

import { GetOneUserInput } from '../dto/get-one-user-input.dto';

@Injectable()
export class UserDeleteService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly readService: UserReadService,
    private readonly basicAclService: BasicAclService,
  ) {}

  public async delete(input: GetOneUserInput): Promise<User> {
    // get the user
    const existingUser = await this.readService.getOneByFields({
      fields: {
        authUid: input.authUid,
      },
      checkIfExists: true,
      relations: ['lender', 'borrower'],
    });

    // check if the user exists
    if (!existingUser) {
      throw new NotFoundException(
        `the user with the authUid ${input.authUid} does not exist.`,
      );
    }

    if (existingUser.lender) {
      // delete the lender
      await this.userRepository.query(
        `DELETE FROM lender WHERE id = '${existingUser.lender.id}'`,
      );
    }

    if (existingUser.borrower) {
      // delete the loans
      await this.userRepository.query(
        `DELETE FROM loan WHERE borrower_id = '${existingUser.borrower.id}'`,
      );

      // delete the borrower
      await this.userRepository.query(
        `DELETE FROM borrower WHERE id = '${existingUser.borrower.id}'`,
      );
    }

    // delete the user
    const deletedUser = await this.userRepository.remove(existingUser);

    // delete the user in ACL
    await this.basicAclService.deleteUser({
      authUid: deletedUser.authUid,
    });

    return deletedUser;
  }
}
