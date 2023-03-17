import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from 'nestjs-basic-acl-sdk';

import { LoanService } from './services/loan.service';

import { CreateLoanInput } from './dto/cretae-loan-input.dto';
import { GetOneLoanInput } from './dto/get-one-loan-input.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  /* CREATE RELATED ENDPOINTS */
  @Public()
  @Post()
  createLoan(@Body() input: CreateLoanInput) {
    return this.loanService.createService.create(input);
  }

  /* CREATE RELATED ENDPOINTS */

  /* READ RELATED ENDPOINTS */

  @Public()
  @Get('minimum-payment-amount')
  getMinimumPaymentAmount(@Query() input: GetOneLoanInput) {
    return this.loanService.readService.getMinimumPaymentAmount(input);
  }

  /* READ RELATED ENDPOINTS */
}
