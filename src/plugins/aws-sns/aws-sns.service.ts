import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

import appConfig from '../../config/app.config';

import { SendSmsInput } from './dto/send-sms-input.dto';

@Injectable()
export class AwsSnsService {
  private client: SNSClient;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    const { aws } = this.appConfiguration;

    this.client = new SNSClient({ region: aws.region });
  }

  public async sendSms(input: SendSmsInput) {
    const { phoneNumber, message } = input;

    const command = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: message,
    });

    await this.client.send(command);

    Logger.log('sms sent', AwsSnsService.name);
  }
}
