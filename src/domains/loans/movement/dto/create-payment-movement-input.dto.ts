import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { MovementType } from '../movement.entity';

enum PaymentMovementType {
  PAYMENT_TERM_REDUCTION = MovementType.PAYMENT_TERM_REDUCTION,
  PAYMENT_INSTALLMENT_AMOUNT_REDUCTION = MovementType.PAYMENT_INSTALLMENT_AMOUNT_REDUCTION,
}

export class CreatePaymentMovementInput {
  @IsUUID()
  readonly loanUid: string;

  @IsNumber()
  readonly amount: number;

  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly paymentDate: string;

  @IsOptional()
  @IsEnum(PaymentMovementType, {
    message: `type must be one of ${Object.values(PaymentMovementType).join(
      ', ',
    )}`,
  })
  readonly type?: string;
}
