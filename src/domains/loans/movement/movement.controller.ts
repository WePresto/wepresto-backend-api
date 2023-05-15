import {
  Body,
  Controller,
  Get,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PermissionName } from 'nestjs-basic-acl-sdk';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { MovementService } from './services/movement.service';

import { CreatePaymentMovementInput } from './dto/create-payment-movement-input.dto';
import { GetOneMovementInput } from './dto/get-one-movement-input.dto';
import { GetLoanMovementsInput } from './dto/get-loan-movements-input.dto';

@ApiTags('movements')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  /* CREATE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Create a payment',
  })
  @PermissionName('movements:createPayment')
  @UseInterceptors(FileInterceptor('file'))
  @Post('payment')
  createPayment(
    @Body() input: CreatePaymentMovementInput,
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
    return this.movementService.createService.createPayment({ ...input, file });
  }

  @ApiExcludeEndpoint()
  @PermissionName('movements:createLatePaymentInterest')
  @Post('late-payment-interest')
  createLatePaymentInterest() {
    return this.movementService.createService.createLatePaymentInterest();
  }

  /* CREATE RELATED ENDPOINTS */

  /* READ RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Get loan installment info',
  })
  @PermissionName('movements:getLoanInstallmentInfo')
  @Get('loan-installment-info')
  getLoanInstallmentInfo(@Query() input: GetOneMovementInput) {
    return this.movementService.readService.getLoanInstallmentInfo(input);
  }

  @ApiOperation({
    summary: 'Get loan movements',
  })
  @PermissionName('movements:getLoanMovements')
  @Get('loan-movements')
  getLoanMovements(@Query() input: GetLoanMovementsInput) {
    return this.movementService.readService.getLoanMovements(input);
  }

  /* READ RELATED ENDPOINTS */
}
