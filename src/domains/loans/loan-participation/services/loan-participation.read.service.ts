import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { LoanParticipation } from '../loan-participation.entity';

import { BaseService } from '../../../../common/base.service';

export class LoanParticipationReadService extends BaseService<LoanParticipation> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(LoanParticipation)
    private readonly loanParticipationRepository: Repository<LoanParticipation>,
  ) {
    super(loanParticipationRepository);
  }
}
