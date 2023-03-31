import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'nestjs-basic-acl-sdk';

import { LenderService } from './services/lender.service';

import { GetOneLenderInput } from './dto/get-one-lender-input.dto';

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
  @Get('resume')
  create(@Query() input: GetOneLenderInput) {
    return this.lenderService.readService.getParticipationsResume(input);
  }

  /* READ RELATED ENDPOINTS */
}
