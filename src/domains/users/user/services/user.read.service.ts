import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { User, DocumentType } from '../user.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneUserInput } from '../dto/get-one-user-input.dto';

@Injectable()
export class UserReadService extends BaseService<User> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  public async getOne(input: GetOneUserInput): Promise<User> {
    const existingUser = await this.getOneByFields({
      fields: {
        authUid: input.authUid,
      },
      checkIfExists: true,
      relations: ['lender', 'borrower'],
    });

    return existingUser;
  }

  public getDocumentTypes() {
    // construct and object array with the enum values
    const documentTypes = Object.keys(DocumentType).map((key) => ({
      name: key
        .split('_')
        .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
        .join(' '),
      value: DocumentType[key],
    }));

    return documentTypes;
  }
}
