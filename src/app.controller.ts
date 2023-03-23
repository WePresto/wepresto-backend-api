import { Controller, Get } from '@nestjs/common';
import { Public } from 'nestjs-basic-acl-sdk';
import { ApiOperation } from '@nestjs/swagger';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Get greeting message',
  })
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
