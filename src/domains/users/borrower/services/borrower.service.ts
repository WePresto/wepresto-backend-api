import { Injectable } from '@nestjs/common';

import { BorrowerReadService } from './borrower.read.service';

@Injectable()
export class BorrowerService {
  constructor(public readonly readService: BorrowerReadService) {}
}
