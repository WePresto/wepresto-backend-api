import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan } from '../loan.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneLoanInput } from '../dto/get-one-loan-input.dto';

@Injectable()
export class LoanReadService extends BaseService<Loan> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {
    super(loanRepository);
  }

  public async getOne(input: GetOneLoanInput): Promise<Loan> {
    const { uid } = input;

    const existingLoan = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    return existingLoan;
  }
}
