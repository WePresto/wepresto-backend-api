import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { MovementType } from '../movement.entity';
import { ApiProperty } from '@nestjs/swagger';

enum PaymentMovementType {
  PAYMENT_TERM_REDUCTION = MovementType.PAYMENT_TERM_REDUCTION,
  PAYMENT_INSTALLMENT_AMOUNT_REDUCTION = MovementType.PAYMENT_INSTALLMENT_AMOUNT_REDUCTION,
}

export class CreatePaymentMovementInput {
  @ApiProperty({
    example: 'f0a0a0a0-a0a0-0a0a-0a0a-a0a0a0a0a0a0',
  })
  @IsUUID()
  readonly loanUid: string;

  @ApiProperty({
    example: 1000,
  })
  @IsNumberString()
  readonly amount: string;

  @ApiProperty({
    example: '2020-01-01',
  })
  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly paymentDate: string;

  @ApiProperty({
    enum: Object.values(PaymentMovementType),
    example: PaymentMovementType.PAYMENT_TERM_REDUCTION,
  })
  @IsOptional()
  @IsEnum(PaymentMovementType, {
    message: `type must be one of ${Object.values(PaymentMovementType).join(
      ', ',
    )}`,
  })
  readonly type?: string;

  readonly file?: any;
}
