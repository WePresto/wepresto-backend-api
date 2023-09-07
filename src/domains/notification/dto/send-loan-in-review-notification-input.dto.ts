export class SendLoanInReviewNotificationInput {
  readonly borrowerEmail: string;

  readonly borrowerPhoneNumber: string;

  readonly borrowerFirstName: string;

  readonly loanUid: string;

  readonly loanAlias?: string;
}
