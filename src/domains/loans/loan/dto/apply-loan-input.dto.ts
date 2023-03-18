import { IsNumber, IsUUID } from 'class-validator';

export class ApplyLoanInput {
  @IsUUID()
  borrowerUid: string;

  @IsNumber()
  amount: number;
}
