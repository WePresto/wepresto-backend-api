import { Injectable } from '@nestjs/common';

import { LoanParticipationCreateService } from './loan-participation.create.service';

@Injectable()
export class LoanParticipationService {
  constructor(public readonly createService: LoanParticipationCreateService) {}
}
