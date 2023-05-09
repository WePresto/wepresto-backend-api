import { Withdrawal } from '../../../domains/loans/withdrawal/withdrawal.entity';

export class SendNewWithdrawalRequestMessageInput {
  readonly withdrawal: Withdrawal;
}
