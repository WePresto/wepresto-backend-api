import {
  Inject,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { PaymentAttempt } from '../payment-attempt.entity';

import { LoanService } from '../../../loans/loan/services/loan.service';

@Injectable()
export class PaymentAttemptCreateService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(PaymentAttempt)
    private readonly paymentAttemptRepository: Repository<PaymentAttempt>,
    private readonly loanService: LoanService,
  ) {}

  public async create(input: any) {
    const { loanUid, amount } = input;

    // get loan
    const existingLoan = await this.loanService.readService.getOne({
      uid: loanUid,
    });
  }
}
