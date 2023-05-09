import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'nestjs-basic-acl-sdk';

import { WithdrawalService } from './services/withdrawal.service';

import { RequestWithdrawalInput } from './dto/request-withdrawal-input.dto';

@ApiTags('withdrawals')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  /* CREATE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Request a withdrawal',
  })
  @Public()
  @Post('withdrawal-request')
  apply(@Body() input: RequestWithdrawalInput) {
    return this.withdrawalService.createService.requestWithdrawal(input);
  }

  /* CREATE RELATED ENDPOINTS */
}
