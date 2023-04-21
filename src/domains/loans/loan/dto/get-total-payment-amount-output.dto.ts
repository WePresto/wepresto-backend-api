import { Movement } from '../../movement/movement.entity';

export class GetTotalPaymentAmountOutput {
  readonly totalAmount: number;

  readonly interest: number;

  readonly principal: number;

  readonly overDueInterest: number;

  readonly movements: Movement[];
}
