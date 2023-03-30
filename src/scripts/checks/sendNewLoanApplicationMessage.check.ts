import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppModule } from '../../app.module';

import { Loan } from '../../domains/loans/loan/loan.entity';

import { WeprestoSlackService } from '../../plugins/wepresto-slack/wepresto-slack.service';

(async () => {
  // create the app context
  const app = await NestFactory.createApplicationContext(AppModule);

  // get the service
  const wePrestoSlackService = app.get(WeprestoSlackService);
  // get the repository
  const loanRepository = app.get(getRepositoryToken(Loan));

  // get the loan
  const loanUid = '124cfcf0-b637-4ece-bf90-1f78592cf9ec';

  const existingLoan = await loanRepository
    .createQueryBuilder('loan')
    .innerJoinAndSelect('loan.borrower', 'borrower')
    .innerJoinAndSelect('borrower.user', 'user')
    .where('loan.uid = :loanUid', { loanUid })
    .getOne();

  // send the message
  await wePrestoSlackService.sendNewLoanApplicationMessage({
    loan: existingLoan,
  });
})();
