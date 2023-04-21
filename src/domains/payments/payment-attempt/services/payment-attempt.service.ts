import { Injectable } from '@nestjs/common';

import { PaymentAttemptCreateService } from './payment-attempt.create.service';

@Injectable()
export class LoanParticipationService {
  constructor(public readonly createService: PaymentAttemptCreateService) {}
}
