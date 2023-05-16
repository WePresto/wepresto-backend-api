import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Borrower } from '../borrower.entity';
import { LoanStatus } from '../../../loans/loan/loan.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneBorrowerInput } from '../dto/get-one-borrower-input.dto';
import { GetManyBorrowersInput } from '../dto/get-many-borrowers-input.dto';
import { GetBorrowerLoansInput } from '../dto/get-borrower-loans-input.dto';

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
      relations: ['user'],
      loadRelationIds: false,
    });

    return existingBorrower;
  }

  public async getLoans(input: GetBorrowerLoansInput) {
    const { uid, statuses, q, take = '10', skip = '0' } = input;

    let parsedStatuses: string[] = [];
    if (statuses) {
      parsedStatuses = statuses.split(',').map((type) => type.trim());

      // check if the types are valid
      parsedStatuses.forEach((status) => {
        if (!Object.values(LoanStatus).includes(status as LoanStatus)) {
          throw new BadRequestException(`invalid loan status ${status}`);
        }
      });
    }

    const query = this.borrowerRepository
      .createQueryBuilder('borrower')
      .leftJoinAndSelect('borrower.loans', 'loan')
      .where('borrower.uid = :uid', { uid });

    if (q) {
      query.andWhere('loan.status ILIKE :q', {
        q: `%${q}%`,
      });
    }

    if (parsedStatuses.length > 0) {
      query.andWhere('loan.status IN (:...statuses)', {
        statuses: parsedStatuses,
      });
    }

    const { loans } = (await query.getOne()) || { loans: [] };

    return {
      count: loans.length,
      loans: loans.slice(+skip, +skip + +take),
    };
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

    query.orderBy('user.createdAt', 'ASC');

    const [borrowers, count] = await query.getManyAndCount();

    return {
      count,
      borrowers,
    };
  }
}
