import { IsNumber, IsUUID } from 'class-validator';

export class CreateLoanParticipationInput {
  @IsUUID()
  readonly loanUid: string;

  @IsUUID()
  readonly lenderUid: string;

  @IsNumber()
  readonly amount: number;
}
