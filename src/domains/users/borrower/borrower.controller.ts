import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionName, Public } from 'nestjs-basic-acl-sdk';

import { RedisCacheTTL } from '../../../plugins/redis-cache/decorators/redis-cache-ttl.decorator';

import { BorrowerService } from './services/borrower.service';

import { GetManyBorrowersInput } from './dto/get-many-borrowers-input.dto';
import { GetBorrowerLoansInput } from './dto/get-borrower-loans-input.dto';
import { GetOneBorrowerInput } from './dto/get-one-borrower-input.dto';

@ApiTags('borrowers')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('borrowers')
export class BorrowerController {
  constructor(private readonly borrowerService: BorrowerService) {}

  /* READ RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Get borrower loans',
  })
  @RedisCacheTTL(0)
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

  @ApiOperation({
    summary: 'Get borrower',
  })
  @PermissionName('borrowers:getOne')
  @Get(':uid')
  getOne(@Param() input: GetOneBorrowerInput) {
    return this.borrowerService.readService.getOne(input);
  }

  @ApiOperation({
    summary: 'Get borrower loans in progress',
  })
  @RedisCacheTTL(0)
  @Public()
  @Get('loans/in-progress')
  getLoansInProcess(@Query() input: GetBorrowerLoansInput) {
    return this.borrowerService.readService.getLoansInProcess(input);
  }

  /* READ RELATED ENDPOINTS */
}
