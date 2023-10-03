import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { MailingService } from '../../plugins/mailing/mailing.service';
import { AwsSnsService } from '../../plugins/aws-sns/aws-sns.service';

import { isHolidayOrWeekend } from '../../utils/is-holyday-or-weekend.util';
import { getReferenceDate } from '../../utils';

import { SendEarlyPaymentNotificationAInput } from './dto/send-early-payment-notification-a-input.dto';
import { SendEarlyPaymentNotificationBInput } from './dto/send-early-payment-notification-b-input.dto';
import { SendEarlyPaymentNotificationCInput } from './dto/send-early-payment-notification-c-input.dto';
import { SendLatePaymentNotificationAInput } from './dto/send-late-payment-notification-a-input.dto';
import { SendLatePaymentNotificationBInput } from './dto/send-late-payment-notification-b-input.dto';
import { SendLatePaymentNotificationCInput } from './dto/send-late-payment-notification-c-input.dto';
import { SendNewInvestmentOpportunityNotificationInput } from './dto/send-new-investment-opportunity-notification-input.dto';
import { SendPaymentReceivedNotificationInput } from './dto/send-payment-received-notification-input.dto';
import { SendLoanInFundingNotificationInput } from './dto/send-loan-in-funding-notification-input.dto';
import { SendLoanInReviewNotificationInput } from './dto/send-loan-in-review-notification-input.dto';
import { SendLoanPaticipationReceivedNotificationInput } from './dto/send-loan-paticipation-received-notification-input.dto';
import { SendLoanRejectedNotificationInput } from './dto/send-loan-rejected-notification-input.dto';
import { SendLoanApprovedNotificationInput } from './dto/send-loan-approved-notification-input.dto';
import { SendLoanFullyFundedNotificationInput } from './dto/send-loan-fully-funded-notification-input.dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly mailingService: MailingService,
    private readonly awsSnsService: AwsSnsService,
  ) {}

  private shouldSendNotification({ timezone }: { timezone: string }) {
    const currentReferenceDate = getReferenceDate(new Date(), timezone);

    const currentDateIsHolidayOrWeekend = isHolidayOrWeekend(
      'CO', // TODO: Get country code based on timezone
      currentReferenceDate,
    );

    if (currentDateIsHolidayOrWeekend) {
      Logger.log(
        `Current date is holiday or weekend, no notification will be sent`,
        NotificationService.name + '.shouldSendNotification',
      );
      return false;
    }

    return true;
  }

  public async sendEarlyPaymentNotificationA(
    input: SendEarlyPaymentNotificationAInput,
  ): Promise<void> {
    const { email, firstName, alias, dueDate } = input;

    const shouldSendNotification = this.shouldSendNotification({
      timezone: 'America/Bogota',
    });

    if (!shouldSendNotification) {
      return;
    }

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

    const shouldSendNotification = this.shouldSendNotification({
      timezone: 'America/Bogota',
    });

    if (!shouldSendNotification) {
      return;
    }

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
    const { email, phoneNumber, firstName, alias, link } = input;

    const shouldSendNotification = this.shouldSendNotification({
      timezone: 'America/Bogota',
    });

    if (!shouldSendNotification) {
      return;
    }

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_EARLY_PAYMENT_NOTIFICATION_C',
        subject: 'WePreso - Notificación de pronto pago',
        to: email,
        parameters: {
          firstName,
          alias,
          link,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber,
        message: `[WePresto] ${firstName}, hoy es el último día para realizar el pago de tu cuota. Ingresa para realizar el pago :)`,
      }),
    ]);
  }

  public async sendLatePaymentNotificationA(
    input: SendLatePaymentNotificationAInput,
  ) {
    const { email, phoneNumber, firstName, link } = input;

    const shouldSendNotification = this.shouldSendNotification({
      timezone: 'America/Bogota',
    });

    if (!shouldSendNotification) {
      return;
    }

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LATE_PAYMENT_NOTIFICATION_A',
        subject: 'WePresto - Notificación por impago',
        to: email,
        parameters: {
          firstName,
          link,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber,
        message: `[WePresto] ${firstName}, tú prestamo está en mora. Ingresa para obtener más información y realizar el pago`,
      }),
    ]);
  }

  public async sendLatePaymentNotificationB(
    input: SendLatePaymentNotificationBInput,
  ) {
    const { email, phoneNumber, firstName, link } = input;

    const shouldSendNotification = this.shouldSendNotification({
      timezone: 'America/Bogota',
    });

    if (!shouldSendNotification) {
      return;
    }

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LATE_PAYMENT_NOTIFICATION_B',
        subject: 'WePresto - Notificación por impago',
        to: email,
        parameters: {
          firstName,
          link,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber,
        message: `[WePresto] ${firstName}, tú prestamo está en mora. Ingresa, obtén más información y animáte a realizar el pago minimo`,
      }),
    ]);
  }

  public async sendLatePaymentNotificationC(
    input: SendLatePaymentNotificationCInput,
  ): Promise<void> {
    const { email, phoneNumber, firstName, link } = input;

    const shouldSendNotification = this.shouldSendNotification({
      timezone: 'America/Bogota',
    });

    if (!shouldSendNotification) {
      return;
    }

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LATE_PAYMENT_NOTIFICATION_C',
        subject: 'WePresto - Notificación por impago',
        to: email,
        parameters: {
          firstName,
          link,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber,
        message: `[WePresto] ${firstName}, tú prestamo está en mora. Ingresa y comunicate con nosotros si tienes inconvenientes`,
      }),
    ]);
  }

  public async sendNewInvestmentOpportunityNotification(
    input: SendNewInvestmentOpportunityNotificationInput,
  ) {
    const { email, phoneNumber, firstName, loanUid, link } = input;

    const shouldSendNotification = this.shouldSendNotification({
      timezone: 'America/Bogota',
    });

    if (!shouldSendNotification) {
      return;
    }

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'LENDER_NEW_INVESTMENT_OPPORTUNITY_NOTIFICATION',
        subject: 'WePresto - Nueva oportunidad de inversión',
        to: email,
        parameters: {
          firstName,
          loanUid,
          link,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber,
        message: `[WePresto] ${firstName}, hay una nueva oportunidad de inversión. Ve a la opción de Oportunidades, puede interesarte ;)`,
      }),
    ]);
  }

  public async sendPaymentReceivedNotification(
    input: SendPaymentReceivedNotificationInput,
  ) {
    const { email, phoneNumber, firstName, loanUid, paymentAmount, loanAlias } =
      input;

    const loanName = loanAlias
      ? `${loanUid.split('-')[4]} - ${loanAlias}`
      : loanUid.split('-')[4];

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_PAYMENT_RECEIVED',
        subject: 'WePresto - Pago recibido!',
        to: email,
        parameters: {
          firstName,
          loanName,
          paymentAmount,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber,
        message: `[WePresto] ${firstName}, muchas gracias! Hemos recibido el pago por ${paymentAmount}, puedes ingresar y revisarlo`,
      }),
    ]);
  }

  public async sendLoanInFundingNotification(
    input: SendLoanInFundingNotificationInput,
  ) {
    const {
      borrowerFirstName,
      borrowerEmail,
      borrowerPhoneNumber,
      loanConsecutive,
    } = input;

    await Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LOAN_IN_FUNDING_NOTIFICATION',
        subject: 'WePresto - Préstamo en financiación',
        to: borrowerEmail,
        parameters: {
          borrowerFirstName,
          loanConsecutive,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber: borrowerPhoneNumber,
        message: `[WePresto] ${borrowerFirstName}, tu préstamo ${loanConsecutive} ha sido publicado y está en proceso de financiación.`,
      }),
    ]);

    await this.awsSnsService.sendSms({
      phoneNumber: borrowerPhoneNumber,
      message: `[WePresto] ${borrowerFirstName}, tu préstamo ${loanConsecutive} ha sido publicado y está en proceso de financiación.`,
    });
  }

  public async sendLoanInReviewNotification(
    input: SendLoanInReviewNotificationInput,
  ) {
    const {
      borrowerEmail,
      borrowerPhoneNumber,
      borrowerFirstName,
      loanUid,
      loanAlias,
    } = input;

    const loanName = loanAlias
      ? `${loanUid.split('-')[4]} - ${loanAlias}`
      : loanUid.split('-')[4];

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LOAN_IN_REVIEW_NOTIFICATION',
        subject: 'WePresto - Préstamo en revisión',
        to: borrowerEmail,
        parameters: {
          firstName: borrowerFirstName,
          loanName,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber: borrowerPhoneNumber,
        message: `[WePresto] ${borrowerFirstName}, tu préstamo está en revisión.`,
      }),
    ]);
  }

  public async sendLoanParticipationReceivedNotification(
    input: SendLoanPaticipationReceivedNotificationInput,
  ): Promise<void> {
    const {
      lenderEmail,
      lenderPhoneNumber,
      lenderFirstName,
      loanUid,
      loanParticipationAmount,
      link,
    } = input;

    const loanName = loanUid.split('-')[4];

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'LENDER_LOAN_PARTICIPATION_RECEIVED_NOTIFICATION',
        subject: 'WePresto - Participación recibida',
        to: lenderEmail,
        parameters: {
          firstName: lenderFirstName,
          loanName,
          amount: loanParticipationAmount,
          link,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber: lenderPhoneNumber,
        message: `[WePresto] ${lenderFirstName}, recibimos tu inversion en el préstamo ${loanName}.`,
      }),
    ]);
  }

  public async sendLoanRejectedNotification(
    input: SendLoanRejectedNotificationInput,
  ) {
    const {
      borrowerEmail,
      borrowerPhoneNumber,
      borrowerFirstName,
      loanConsecutive,
      laonComment,
    } = input;

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LOAN_REJECTED_NOTIFICATION',
        subject: 'WePresto - Préstamo rechazado',
        to: borrowerEmail,
        parameters: {
          borrowerFirstName,
          loanConsecutive,
          laonComment,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber: borrowerPhoneNumber,
        message: `[WePresto] ${borrowerFirstName}, tu préstamo ${loanConsecutive} ha sido rechazado. A tú correo electrónico enviamos más información`,
      }),
    ]);
  }

  public async sendLoanApprovedNotification(
    input: SendLoanApprovedNotificationInput,
  ) {
    const {
      borrowerEmail,
      borrowerPhoneNumber,
      borrowerFirstName,
      loanConsecutive,
    } = input;

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LOAN_APPROVED_NOTIFICATION',
        subject: 'WePresto - Préstamo aprobado',
        to: borrowerEmail,
        parameters: {
          borrowerFirstName,
          loanConsecutive,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber: borrowerPhoneNumber,
        message: `[WePresto] ${borrowerFirstName}, tu préstamo ${loanConsecutive} ha sido aprobado! Ingresa para ver más información`,
      }),
    ]);
  }

  public async sendLoanFullyFundedNotification(
    input: SendLoanFullyFundedNotificationInput,
  ) {
    const {
      borrowerEmail,
      borrowerPhoneNumber,
      borrowerFirstName,
      loanConsecutive,
    } = input;

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LOAN_FULLY_FUNDED_NOTIFICATION',
        subject: 'WePresto - Préstamo fondeado',
        to: borrowerEmail,
        parameters: {
          borrowerFirstName,
          loanConsecutive,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber: borrowerPhoneNumber,
        message: `[WePresto] ${borrowerFirstName}, tu préstamo ${loanConsecutive} ha sido fondeado! Ingresa para ver más información`,
      }),
    ]);
  }

  public async sendLoanDisbursedNotification(
    input: SendLoanFullyFundedNotificationInput,
  ) {
    const {
      borrowerEmail,
      borrowerPhoneNumber,
      borrowerFirstName,
      loanConsecutive,
    } = input;

    Promise.all([
      this.mailingService.sendEmail({
        templateName: 'BORROWER_LOAN_DISBURSED_NOTIFICATION',
        subject: 'WePresto - Préstamo desembolsado',
        to: borrowerEmail,
        parameters: {
          borrowerFirstName,
          loanConsecutive,
        },
      }),
      this.awsSnsService.sendSms({
        phoneNumber: borrowerPhoneNumber,
        message: `[WePresto] ${borrowerFirstName}, tu préstamo ${loanConsecutive} ha sido desembolsado! Ingresa para ver más información`,
      }),
    ]);
  }
}
