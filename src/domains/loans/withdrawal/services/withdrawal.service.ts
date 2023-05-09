import { Injectable } from '@nestjs/common';

import { WithdrawalCreateService } from './withdrawal.create.service';
import { WithdrawalReadService } from './withdrawal.read.service';

@Injectable()
export class WithdrawalService {
  constructor(
    public readonly createService: WithdrawalCreateService,
    public readonly readService: WithdrawalReadService,
  ) {}
}
