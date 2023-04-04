import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { MailingService } from '../../plugins/mailing/mailing.service';

import { SendEarlyPaymentNotificationAInput } from './dto/send-early-payment-notification-a-input.dto';
import { SendEarlyPaymentNotificationBInput } from './dto/send-early-payment-notification-b-input.dto';
import { SendEarlyPaymentNotificationCInput } from './dto/send-early-payment-notification-c-input.dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly mailingService: MailingService,
  ) {}

  public async sendEarlyPaymentNotificationA(
    input: SendEarlyPaymentNotificationAInput,
  ): Promise<void> {
    const { email, firstName, alias, dueDate } = input;

    await this.mailingService.sendEmail({
      templateName: 'BORROWER_EARLY_PAYMENT_NOTIFICATION_A',
      subject: 'Notificación de pronto pago',
      to: email,
      parameters: {
        firstName,
        alias,
        dueDate,
      },
    });
  }

  public async sendEarlyPaymentNotificationB(
    input: SendEarlyPaymentNotificationBInput,
  ): Promise<void> {
    const { email, firstName, alias, link } = input;

    await this.mailingService.sendEmail({
      templateName: 'BORROWER_EARLY_PAYMENT_NOTIFICATION_B',
      subject: 'Notificación de pronto pago',
      to: email,
      parameters: {
        firstName,
        alias,
        link,
      },
    });
  }

  public async sendEarlyPaymentNotificationC(
    input: SendEarlyPaymentNotificationCInput,
  ): Promise<void> {
    const { email, firstName, alias, link } = input;

    await this.mailingService.sendEmail({
      templateName: 'BORROWER_EARLY_PAYMENT_NOTIFICATION_C',
      subject: 'Notificación de pronto pago',
      to: email,
      parameters: {
        firstName,
        alias,
        link,
      },
    });
  }
}
