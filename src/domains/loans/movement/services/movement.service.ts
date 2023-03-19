import { Injectable } from '@nestjs/common';

import { MovementCreateService } from './movement.create.service';
import { MovementReadService } from './movement.read.service';

@Injectable()
export class MovementService {
  constructor(
    public readonly createService: MovementCreateService,
    public readonly readService: MovementReadService,
  ) {}
}
