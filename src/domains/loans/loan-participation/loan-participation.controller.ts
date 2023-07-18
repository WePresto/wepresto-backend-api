import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionName } from 'nestjs-basic-acl-sdk';

import { LoanParticipationService } from './services/loan-participation.service';

import { CreateLoanParticipationInput } from './dto/create-loan-participation-input.dto';

@ApiTags('loan-participations')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('loan-participations')
export class LoanParticipationController {
  constructor(private readonly loanService: LoanParticipationService) {}

  /* CREATE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Create a loan participation',
  })
  @PermissionName('loan-participation:create')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @Body() input: CreateLoanParticipationInput,
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
    return this.loanService.createService.create({ ...input, file });
  }

  /* CREATE RELATED ENDPOINTS */
}
