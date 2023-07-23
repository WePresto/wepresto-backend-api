import { Borrower } from '../../../domains/users/borrower/borrower.entity';

export class SendStartCollectionManagementInput {
  readonly loan: {
    readonly uid: string;
    readonly dueDate: string;
    readonly amount: number;
    readonly minimumPaymentAmount: number;
    readonly borrower: Borrower;
  };
}
