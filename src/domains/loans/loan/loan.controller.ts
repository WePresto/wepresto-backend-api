import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PermissionName, Public } from 'nestjs-basic-acl-sdk';

import { LoanService } from './services/loan.service';

import { ApplyLoanInput } from './dto/apply-loan-input.dto';
import { GetOneLoanInput } from './dto/get-one-loan-input.dto';
import { ReviewLoanInput } from './dto/review-loan-input.dto';
import { RejectLoanInput } from './dto/reject-loan-input.dto';
import { ApproveLoanInput } from './dto/approve-loan-input.dto';
import { DisburseLoanInput } from './dto/disburse-loan-input.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  /* CREATE RELATED ENDPOINTS */

  @PermissionName('loans:apply')
  @Post('loan-apply')
  apply(@Body() input: ApplyLoanInput) {
    return this.loanService.createService.apply(input);
  }

  /* CREATE RELATED ENDPOINTS */

  /* READ RELATED ENDPOINTS */

  @Public()
  // @PermissionName('loans:getMinimumPaymentAmount')
  @Get('minimum-payment-amount')
  getMinimumPaymentAmount(@Query() input: GetOneLoanInput) {
    return this.loanService.readService.getMinimumPaymentAmount(input);
  }

  /* READ RELATED ENDPOINTS */

  /* UPDATE RELATED ENDPOINTS */

  @Public()
  @Patch('loan-review')
  review(@Body() input: ReviewLoanInput) {
    return this.loanService.updateService.review(input);
  }

  @Public()
  @Patch('loan-reject')
  reject(@Body() input: RejectLoanInput) {
    return this.loanService.updateService.reject(input);
  }

  @Public()
  @Patch('loan-approve')
  approve(@Body() input: ApproveLoanInput) {
    return this.loanService.updateService.approve(input);
  }

  @Public()
  @Patch('loan-disburse')
  disburse(@Body() input: DisburseLoanInput) {
    return this.loanService.updateService.disburse(input);
  }

  /* UPDATE RELATED ENDPOINTS */
}
