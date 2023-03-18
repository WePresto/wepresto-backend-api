import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Borrower } from '../borrower.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneBorrowerInput } from '../dto/get-one-borrower-input.dto';

@Injectable()
export class BorrowerReadService extends BaseService<Borrower> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Borrower)
    private readonly borrowerRepository: Repository<Borrower>,
  ) {
    super(borrowerRepository);
  }

  public async getOne(input: GetOneBorrowerInput): Promise<Borrower> {
    const { uid } = input;

    const existingBorrower = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    return existingBorrower;
  }

  public async getLoans(input: GetOneBorrowerInput) {
    const { uid } = input;

    const existingBorrower = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      relations: ['loans'],
    });

    const { loans } = existingBorrower;

    return loans;
  }
}
