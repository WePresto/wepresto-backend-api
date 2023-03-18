import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ApproveLoanInput {
  @IsUUID()
  readonly uid: string;

  @IsNumber()
  readonly annualInterestRate: number;

  @IsNumber()
  readonly term: number;

  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly startDate: string;

  @IsOptional()
  @IsString()
  readonly comment?: string;
}
