import { IsNumberString, IsOptional, IsUUID } from 'class-validator';

export class CreateLoanParticipationInput {
  @IsUUID()
  readonly loanUid: string;

  @IsUUID()
  readonly lenderUid: string;

  @IsNumberString()
  readonly amount: number;

  @IsOptional()
  readonly file?: any;
}
