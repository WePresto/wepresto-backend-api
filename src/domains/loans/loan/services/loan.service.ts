import { Injectable } from '@nestjs/common';

import { LoanCreateService } from './loan.create.service';
import { LoanReadService } from './loan.read.service';
import { LoanUpdateService } from './loan.update.service';

@Injectable()
export class LoanService {
  constructor(
    public readonly createService: LoanCreateService,
    public readonly readService: LoanReadService,
    public readonly updateService: LoanUpdateService,
  ) {}
}
