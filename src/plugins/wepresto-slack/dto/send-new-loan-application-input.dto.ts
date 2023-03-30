import { Loan } from '../../../domains/loans/loan/loan.entity';

export class SendNewLoanApplicationMessageInput {
  readonly loan: Loan;
}
