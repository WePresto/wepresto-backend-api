import { Injectable } from '@nestjs/common';

import { LenderReadService } from './lender.read.service';

@Injectable()
export class LenderService {
  constructor(public readonly readService: LenderReadService) {}
}
