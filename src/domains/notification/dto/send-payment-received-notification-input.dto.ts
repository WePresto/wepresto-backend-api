export class SendPaymentReceivedNotificationInput {
  readonly email: string;

  readonly phoneNumber: string;

  readonly firstName: string;

  readonly loanUid: string;

  readonly paymentAmount: string;
}
