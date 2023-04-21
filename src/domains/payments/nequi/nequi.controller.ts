import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from 'nestjs-basic-acl-sdk';

import { NequiService } from './nequi.service';

import { SendPaymentPushNotificationInput } from './dto/send-payment-push-notification-input.dto';
import { GetPaymentStatusInput } from './dto/get-payment-status-input.dto';

@Controller('nequi')
export class NequiController {
  constructor(private readonly nequiService: NequiService) {}

  @Public()
  @Post('token')
  getAccessToken() {
    return this.nequiService.getAccessToken();
  }

  @Public()
  @Post('payment-notification')
  sendPaymentPushNotification(@Body() input: SendPaymentPushNotificationInput) {
    return this.nequiService.sendPaymentPushNotification(input);
  }

  @Public()
  @Get('payment-status')
  getPaymentStatus(@Body() input: GetPaymentStatusInput) {
    return this.nequiService.getPaymentStatus(input);
  }
}
