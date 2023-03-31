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

  public async getParticipationsResume(input: GetOneLenderInput) {
    const { uid } = input;

    const existingLender = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    if (!existingLender) {
      throw new BadRequestException('Lender not found');
    }

    const queryResult = await this.lenderRepository
      .createQueryBuilder('lender')
      .leftJoinAndSelect('lender.loanParticipations', 'loanParticipation')
      .leftJoinAndSelect('loanParticipation.loan', 'loan')
      .leftJoinAndSelect('loan.movements', 'movement')
      .where('lender.uid = :uid', { uid })
      .getOne();

    let loanParticipations = [];

    loanParticipations = queryResult?.loanParticipations || [];

    const resume = loanParticipations.reduce(
      (pre, cur) => {
        const {
          amount,
          loan: { movements = [] },
        } = cur;

        return {
          totalInvested: pre.totalInvested + amount,
          totalInterest:
            pre.totalInterest +
            movements.reduce((pre, cur) => {
              const { interest, paid } = cur;

              return pre + (paid ? interest : 0);
            }, 0),
        };
      },
      {
        totalInvested: 0,
        totalInterest: 0,
      },
    );

    return resume;
  }
}
