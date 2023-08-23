import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RetoolService } from './retool.service';
import { Public } from 'nestjs-basic-acl-sdk';

@ApiTags('retool')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('retool')
export class RetoolController {
  constructor(private readonly retoolService: RetoolService) {}

  /* READ RELATED ENDPOINTS */
  @Public()
  @Get('loans')
  getLoans() {
    return this.retoolService.getLoans();
  }

  /* READ RELATED ENDPOINTS */
}
