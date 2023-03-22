import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Borrower } from '../borrower.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneBorrowerInput } from '../dto/get-one-borrower-input.dto';
import { GetManyBorrowersInput } from '../dto/get-many-borrowers-input.dto';

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

  public async getMany(input: GetManyBorrowersInput) {
    const { fullName, documentNumber, take = '10', skip = '0' } = input;

    const query = this.borrowerRepository
      .createQueryBuilder('borrower')
      .innerJoinAndSelect('borrower.user', 'user')
      .where('1 = 1')
      .take(+take)
      .skip(+skip);

    if (fullName) {
      query.andWhere('user.fullName ILIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }

    if (documentNumber) {
      query.andWhere('user.documentNumber ILIKE :documentNumber', {
        documentNumber: `%${documentNumber}%`,
      });
    }

    const [borrowers, count] = await query.getManyAndCount();

    return {
      count,
      borrowers,
    };
  }
}
