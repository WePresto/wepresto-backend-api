import { Injectable } from '@nestjs/common';

import { WithdrawalCreateService } from './withdrawal.create.service';
import { WithdrawalReadService } from './withdrawal.read.service';
import { WithdrawalUpdateService } from './withdrawal.update.service';

@Injectable()
export class WithdrawalService {
  constructor(
    public readonly createService: WithdrawalCreateService,
    public readonly readService: WithdrawalReadService,
    public readonly updateService: WithdrawalUpdateService,
  ) {}
}
