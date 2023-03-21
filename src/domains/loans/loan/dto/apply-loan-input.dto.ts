import { IsNumber, IsUUID } from 'class-validator';

export class ApplyLoanInput {
  @IsUUID()
  readonly borrowerUid: string;

  @IsNumber()
  readonly amount: number;
}
