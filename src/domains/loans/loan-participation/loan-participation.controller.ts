import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LoanParticipationService } from './services/loan-participation.service';

import { CreateLoanParticipationInput } from './dto/create-loan-participation-input.dto';
import { Public } from 'nestjs-basic-acl-sdk';

@ApiTags('loan-participations')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('loan-participations')
export class LoanParticipationController {
  constructor(private readonly loanService: LoanParticipationService) {}

  /* CREATE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Create a loan participation',
  })
  @Public()
  @Post()
  create(@Body() input: CreateLoanParticipationInput) {
    return this.loanService.createService.create(input);
  }

  /* CREATE RELATED ENDPOINTS */
}
