import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { WebClient } from '@slack/web-api';

import appConfig from '../../config/app.config';

import { formatCurrency, formatDateTime, getReferenceDate } from '../../utils';

import { SendNewLoanApplicationMessageInput } from './dto/send-new-loan-application-input.dto';

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
    const {
      borrower: { user },
    } = loan;

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
      `<https://wepresto.retool.com/apps/a73c6406-c86d-11ed-a36d-07f8d94cb81b/Loans|View Loan Application> :eyes:`;

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
}
