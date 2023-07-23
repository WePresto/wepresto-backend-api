import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { WebClient } from '@slack/web-api';

import appConfig from '../../config/app.config';

import { formatCurrency, formatDateTime } from '../../utils';

import { SendNewLoanApplicationMessageInput } from './dto/send-new-loan-application-input.dto';
import { SendNewWithdrawalRequestMessageInput } from './dto/send-new-withdrawal-request-message-input.dto';
import { SendStartCollectionManagementInput } from './dto/send-start-collection-management-input.dto';

@Injectable()
export class WeprestoSlackService {
  private webClient: WebClient;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    const {
      slack: { token },
    } = this.appConfiguration;

    this.webClient = new WebClient(token);
  }

  public async sendNewLoanApplicationMessage(
    input: SendNewLoanApplicationMessageInput,
  ) {
    const { loan } = input;
    const { borrower } = loan;
    const { user } = borrower;

    Logger.log(
      `sending new loan application message to slack`,
      WeprestoSlackService.name,
    );

    const message =
      '<!here> *New Loan Application* \n' +
      `Hello team!:wave::skin-tone-2: Just wanted to let you know that we've received a new loan application :fire: from ` +
      // eslint-disable-next-line prettier/prettier
      `*${user.fullName}* for *${formatCurrency(loan.amount)}* over a *${loan.term}* term. The application was submitted on ` +
      `*${formatDateTime(loan.createdAt)}*. Let's take a look at it! \n\n` +
      `<https://admin.wepresto.com/borrowers/${borrower.uid}/loans|View Loan Application> :eyes:`;

    await this.webClient.chat.postMessage({
      channel: '#notifications',
      mrkdwn: true,
      text: message,
    });

    Logger.log(
      `new loan application message sent to slack`,
      WeprestoSlackService.name,
    );
  }

  public async sendNewWithdrawalRequestMessage(
    input: SendNewWithdrawalRequestMessageInput,
  ) {
    const { withdrawal } = input;
    const { lender } = withdrawal;
    const { user } = lender;

    Logger.log(
      `sending new withdrawal request message to slack`,
      WeprestoSlackService.name,
    );

    const message =
      '<!here> *New Withdrawal Request* :money_with_wings: \n' +
      `Hello team! :wave::skin-tone-2: A new withdrawal request has been submitted by *${user.fullName}* ` +
      `for *${formatCurrency(withdrawal.depositAmount, 'COP')}*. ` +
      // eslint-disable-next-line prettier/prettier
      `The request was submitted on *${formatDateTime(withdrawal.createdAt)}*. ` +
      `Please review the request and take any necessary actions. \n\n` +
      `Withdrawal Details: \n` +
      `- Bank: *${withdrawal.accountInfo.bank}*\n` +
      `- Account: *${withdrawal.accountInfo.accountNumber}*\n` +
      `- Amount: *${formatCurrency(withdrawal.depositAmount, 'COP')}*\n\n` +
      `<https://admin.wepresto.com/lenders/${lender.uid}/withdrawals|View Withdrawal Request> :eyes:`;

    await this.webClient.chat.postMessage({
      channel: '#notifications',
      mrkdwn: true,
      text: message,
    });

    Logger.log(
      `new withdrawal request message sent to slack`,
      WeprestoSlackService.name,
    );
  }

  public async sendStartCollectionManagement(
    input: SendStartCollectionManagementInput,
  ) {
    const { loan } = input;

    Logger.log(
      `sending start collection management message to slack`,
      WeprestoSlackService.name,
    );

    const message =
      '<!here> *Start Collection Management* :moneybag: \n' +
      `Hello team! :wave::skin-tone-2: We need to start the collection management process for the loan: ${loan.uid}. ` +
      `Please review the loan and take any necessary actions. \n\n` +
      `Some details: \n` +
      `- Borrower: *${loan?.borrower?.user?.fullName}*\n` +
      `- Phone number: *${loan?.borrower?.user?.phoneNumber}*\n` +
      `- Loan: ${loan.uid}\n` +
      `- Due date: ${loan.dueDate}\n` +
      `- Amount: *${formatCurrency(loan.amount, 'COP')}*\n` +
      // eslint-disable-next-line prettier/prettier
      `- Minimum payment amount: *${formatCurrency(loan.minimumPaymentAmount, 'COP')}*\n\n` +
      `<https://admin.wepresto.com/loans/${loan.uid}|View Loan> :eyes:`;

    await this.webClient.chat.postMessage({
      channel: '#notifications',
      mrkdwn: true,
      text: message,
    });
  }
}
