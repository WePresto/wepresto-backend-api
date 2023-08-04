import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { MailingService } from '../../plugins/mailing/mailing.service';

import { SendEarlyPaymentNotificationAInput } from './dto/send-early-payment-notification-a-input.dto';
import { SendEarlyPaymentNotificationBInput } from './dto/send-early-payment-notification-b-input.dto';
import { SendEarlyPaymentNotificationCInput } from './dto/send-early-payment-notification-c-input.dto';
import { SendLatePaymentNotificationAInput } from './dto/send-late-payment-notification-a-input.dto';
import { SendLatePaymentNotificationBInput } from './dto/send-late-payment-notification-b-input.dto';
import { SendLatePaymentNotificationCInput } from './dto/send-late-payment-notification-c-input.dto';
import { SendNewInvestmentOpportunityNotificationInput } from './dto/send-new-investment-opportunity-notification-input.dto';
import { SendPaymentReceivedNotificationInput } from './dto/send-payment-received-notification-input.dto';

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
      subject: 'WePresto - Notificación de pronto pago',
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
      subject: 'WePresto - Notificación de pronto pago',
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
      subject: 'WePreso - Notificación de pronto pago',
      to: email,
      parameters: {
        firstName,
        alias,
        link,
      },
    });
  }

  public async sendLatePaymentNotificationA(
    input: SendLatePaymentNotificationAInput,
  ) {
    const { email, firstName, link } = input;

    await this.mailingService.sendEmail({
      templateName: 'BORROWER_LATE_PAYMENT_NOTIFICATION_A',
      subject: 'WePresto - Notificación por impago',
      to: email,
      parameters: {
        firstName,
        link,
      },
    });
  }

  public async sendLatePaymentNotificationB(
    input: SendLatePaymentNotificationBInput,
  ) {
    const { email, firstName, link } = input;

    await this.mailingService.sendEmail({
      templateName: 'BORROWER_LATE_PAYMENT_NOTIFICATION_B',
      subject: 'WePresto - Notificación por impago',
      to: email,
      parameters: {
        firstName,
        link,
      },
    });
  }

  public async sendLatePaymentNotificationC(
    input: SendLatePaymentNotificationCInput,
  ): Promise<void> {
    const { email, firstName, link } = input;

    await this.mailingService.sendEmail({
      templateName: 'BORROWER_LATE_PAYMENT_NOTIFICATION_C',
      subject: 'WePresto - Notificación por impago',
      to: email,
      parameters: {
        firstName,
        link,
      },
    });
  }

  public async sendNewInvestmentOpportunityNotification(
    input: SendNewInvestmentOpportunityNotificationInput,
  ) {
    const { email, firstName, loanUid, link } = input;

    await this.mailingService.sendEmail({
      templateName: 'LENDER_NEW_INVESTMENT_OPPORTUNITY_NOTIFICATION',
      subject: 'WePresto - Nueva oportunidad de inversión',
      to: email,
      parameters: {
        firstName,
        loanUid,
        link,
      },
    });
  }

  public async sendPaymentReceivedNotification(
    input: SendPaymentReceivedNotificationInput,
  ) {
    const { email, firstName, loanUid, paymentAmount } = input;

    await this.mailingService.sendEmail({
      templateName: 'BORROWER_PAYMENT_RECEIVED',
      subject: 'WePresto - Pago recibido!',
      to: email,
      parameters: {
        firstName,
        loanUid,
        paymentAmount,
      },
    });
  }
}
