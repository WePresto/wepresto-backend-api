import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionName } from 'nestjs-basic-acl-sdk';

import { BorrowerService } from './services/borrower.service';

import { GetManyBorrowersInput } from './dto/get-many-borrowers-input.dto';
import { GetBorrowerLoansInput } from './dto/get-borrower-loans-input.dto';

@ApiTags('borrowers')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('borrowers')
export class BorrowerController {
  constructor(private readonly borrowerService: BorrowerService) {}

  /* READ RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Get borrower loans',
  })
  @PermissionName('borrowers:getLoans')
  @Get('loans')
  getLoans(@Query() input: GetBorrowerLoansInput) {
    return this.borrowerService.readService.getLoans(input);
  }

  @ApiOperation({
    summary: 'Get borrowers',
  })
  @PermissionName('borrowers:getMany')
  @Get()
  getMany(@Query() input: GetManyBorrowersInput) {
    return this.borrowerService.readService.getMany(input);
  }

  /* READ RELATED ENDPOINTS */
}
