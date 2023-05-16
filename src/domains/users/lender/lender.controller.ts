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

import { LenderService } from './services/lender.service';

import { GetOneLenderInput } from './dto/get-one-lender-input.dto';
import { GetParticipationsInput } from './dto/get-participations-input.dto';

@ApiTags('lenders')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('lenders')
export class LenderController {
  constructor(private readonly lenderService: LenderService) {}

  /* CREATE RELATED ENDPOINTS */

  /* CREATE RELATED ENDPOINTS */

  /* READ RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'get participations resume',
  })
  @Public()
  @Get('participations-resume')
  getParticipationsResume(@Query() input: GetOneLenderInput) {
    return this.lenderService.readService.getParticipationsResume(input);
  }

  @ApiOperation({
    summary: 'get participations',
  })
  @Public()
  @Get('participations')
  create(@Query() input: GetParticipationsInput) {
    return this.lenderService.readService.getParticipations(input);
  }

  @ApiOperation({
    summary: 'get one lender',
  })
  @PermissionName('lenders:getOne')
  @Get(':uid')
  getOne(@Param() input: GetOneLenderInput) {
    return this.lenderService.readService.getOne(input);
  }

  /* READ RELATED ENDPOINTS */
}
