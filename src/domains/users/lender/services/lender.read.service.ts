import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Lender } from '../lender.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneLenderInput } from '../dto/get-one-lender-input.dto';

@Injectable()
export class LenderReadService extends BaseService<Lender> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Lender)
    private readonly lenderRepository: Repository<Lender>,
  ) {
    super(lenderRepository);
  }

  public async getOne(input: GetOneLenderInput): Promise<Lender> {
    const { uid } = input;

    const existingLender = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    return existingLender;
  }
}
