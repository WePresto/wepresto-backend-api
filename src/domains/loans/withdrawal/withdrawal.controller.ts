import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionName, Public } from 'nestjs-basic-acl-sdk';

import { WithdrawalService } from './services/withdrawal.service';

import { RequestWithdrawalInput } from './dto/request-withdrawal-input.dto';
import { GetTotalWithdrawnInput } from './dto/get-total-withdrawn-input.dto';
import { GetAvailableToWithdrawInput } from './dto/get-available-to-withdraw-input.dto';
import { GetLenderWithdrawalsInput } from './dto/get-lender-withdrawals-input.dto';
import { GetOneWithdrawalInput } from './dto/get-one-withdrawal-input.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompleteWithdrawalInput } from './dto/complete-withdrawal-input.dto';

@ApiTags('withdrawals')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  /* CREATE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Request a withdrawal',
  })
  @PermissionName('withdrawals:requestWithdrawal')
  @Post('withdrawal-request')
  requestWithdrawal(@Body() input: RequestWithdrawalInput) {
    return this.withdrawalService.createService.requestWithdrawal(input);
  }

  /* CREATE RELATED ENDPOINTS */

  /* READ RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Get the total withdrawn for a lender',
  })
  @PermissionName('withdrawals:getTotalWithdrawn')
  @Get('total-withdrawn')
  getTotalWithdrawn(@Query() input: GetTotalWithdrawnInput) {
    return this.withdrawalService.readService.getTotalWithdrawn(input);
  }

  @ApiOperation({
    summary: 'Get the available to withdraw for a lender',
  })
  // @PermissionName('withdrawals:getAvailableToWithdraw')
  @Public()
  @Get('available-to-withdraw')
  getAvailableToWithdraw(@Query() input: GetAvailableToWithdrawInput) {
    return this.withdrawalService.readService.getAvailableToWithdraw(input);
  }

  @ApiOperation({
    summary: 'Get the withdrawals for a lender',
  })
  @PermissionName('withdrawals:getLenderWithdrawals')
  @Get('lender-withdrawals')
  getLenderWithdrawals(@Query() input: GetLenderWithdrawalsInput) {
    return this.withdrawalService.readService.getLenderWithdrawals(input);
  }

  @ApiOperation({
    summary: 'Get a withdrawal',
  })
  @PermissionName('withdrawals:getOne')
  @Get(':uid')
  getOne(@Param() input: GetOneWithdrawalInput) {
    return this.withdrawalService.readService.getOne(input);
  }

  /* READ RELATED ENDPOINTS */

  /* UPDATE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Create a payment',
  })
  @PermissionName('withdrawals:complete')
  @UseInterceptors(FileInterceptor('file'))
  @Patch('withdrawal-complete')
  complete(
    @Body() input: CompleteWithdrawalInput,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\b/,
        })
        .addMaxSizeValidator({ maxSize: 15000000 })
        .build({
          fileIsRequired: false,
        }),
    )
    file?: any,
  ) {
    return this.withdrawalService.updateService.complete({ ...input, file });
  }

  /* UPDATE RELATED ENDPOINTS */
}
