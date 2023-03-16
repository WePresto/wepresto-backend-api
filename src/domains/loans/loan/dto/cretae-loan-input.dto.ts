import { IsDateString, IsNumber, IsUUID } from 'class-validator';

export class CreateLoanInput {
  @IsUUID()
  readonly borroweUid: string;

  @IsNumber()
  readonly amount: number;

  @IsNumber()
  readonly annualInterestRate: number;

  @IsNumber()
  readonly term: number;

  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly startDate: string;
}
