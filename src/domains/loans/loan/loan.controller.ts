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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LoanService } from './services/loan.service';

import { getReferenceDate } from '../../../utils';

import { ApplyLoanInput } from './dto/apply-loan-input.dto';
import { GetOneLoanInput } from './dto/get-one-loan-input.dto';
import { ReviewLoanInput } from './dto/review-loan-input.dto';
import { RejectLoanInput } from './dto/reject-loan-input.dto';
import { ApproveLoanInput } from './dto/approve-loan-input.dto';
import { DisburseLoanInput } from './dto/disburse-loan-input.dto';

@ApiTags('loans')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  /* CREATE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Apply for a loan',
  })
  @PermissionName('loans:apply')
  @Post('loan-apply')
  apply(@Body() input: ApplyLoanInput) {
    return this.loanService.createService.apply(input);
  }

  @ApiOperation({
    summary: 'Simulate a loan',
  })
  @Public()
  @Post('loan-simulate')
  simulate(@Body() input: ApplyLoanInput) {
    return this.loanService.createService.simulate(input);
  }

  /* CREATE RELATED ENDPOINTS */

  /* READ RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Get minimum payment amount',
  })
  @PermissionName('loans:getMinimumPaymentAmount')
  @Get('minimum-payment-amount')
  getMinimumPaymentAmount(@Query() input: GetOneLoanInput) {
    const { uid } = input;

    // create a reference date to execute the getMinimumPaymentAmount
    const referenceDate = getReferenceDate(new Date());

    return this.loanService.readService.getMinimumPaymentAmount({
      uid,
      referenceDate,
    });
  }

  @ApiOperation({
    summary: 'Get the possible loan terms',
  })
  @Public()
  @Get('loan-terms')
  getLoanTerms() {
    return this.loanService.readService.getLoanTerms();
  }

  /* READ RELATED ENDPOINTS */

  /* UPDATE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Review a loan',
  })
  @PermissionName('loans:review')
  @Patch('loan-review')
  review(@Body() input: ReviewLoanInput) {
    return this.loanService.updateService.review(input);
  }

  @ApiOperation({
    summary: 'Reject a loan',
  })
  @PermissionName('loans:reject')
  @Patch('loan-reject')
  reject(@Body() input: RejectLoanInput) {
    return this.loanService.updateService.reject(input);
  }

  @ApiOperation({
    summary: 'Approve a loan',
  })
  @PermissionName('loans:approve')
  @Patch('loan-approve')
  approve(@Body() input: ApproveLoanInput) {
    return this.loanService.updateService.approve(input);
  }

  @ApiOperation({
    summary: 'Disburse a loan',
  })
  @PermissionName('loans:disburse')
  @Patch('loan-disburse')
  disburse(@Body() input: DisburseLoanInput) {
    return this.loanService.updateService.disburse(input);
  }

  /* UPDATE RELATED ENDPOINTS */
}
