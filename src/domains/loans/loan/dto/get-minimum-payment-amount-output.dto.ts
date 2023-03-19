import { Movement } from '../../movement/movement.entity';

export class GetMinimumPaymentAmountOutput {
  readonly totalAmount: number;

  readonly interest: number;

  readonly principal: number;

  readonly overDueInterest: number;

  readonly paymentDate: Date | undefined;

  readonly movements: Movement[];
}
