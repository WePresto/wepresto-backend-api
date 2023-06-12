import {
  Body,
  Controller,
  Get,
  Param,
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
import { SimulateLoanInput } from './dto/simulate-loan-input.dto';

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
  simulate(@Body() input: SimulateLoanInput) {
    return this.loanService.createService.simulate(input);
  }

  @ApiOperation({
    summary: 'Send early payment notifications',
  })
  @PermissionName('loans:sendEarlyPaymentNotifications')
  @Post('early-payment-notifications')
  sendEarlyPaymentNotifications() {
    return this.loanService.createService.sendEarlyPaymentNotifications();
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

  @ApiOperation({
    summary: 'Get the total payment amount',
  })
  @PermissionName('loans:getTotalPaymentAmount')
  @Get('total-payment-amount')
  getTotalPaymentAmount(@Query() input: GetOneLoanInput) {
    const { uid } = input;

    // create a reference date to execute the getTotalPaymentAmount
    const referenceDate = getReferenceDate(new Date());

    return this.loanService.readService.getTotalPaymentAmount({
      uid,
      referenceDate,
    });
  }

  @ApiOperation({
    summary: 'Get the loans that need funding',
  })
  @PermissionName('loans:getLoansNeedingFunding')
  @Get('needing-funding')
  getLoansNeedingFunding(@Query() input: any) {
    return this.loanService.readService.getLoansNeedingFunding(input);
  }

  @ApiOperation({
    summary: 'Get the loan',
  })
  @PermissionName('loans:getOne')
  @Get(':uid')
  getOne(@Param() input: GetOneLoanInput) {
    return this.loanService.readService.getOne(input);
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
