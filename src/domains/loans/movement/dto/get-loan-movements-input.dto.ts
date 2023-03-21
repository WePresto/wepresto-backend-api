import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetLoanMovementsInput {
  @IsUUID()
  readonly loanUid: string;

  @IsOptional()
  @IsString()
  readonly types: string;

  @IsOptional()
  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly startDate?: string;

  @IsOptional()
  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly endDate?: string;

  @IsOptional()
  @IsNumberString()
  readonly take?: string;

  @IsOptional()
  @IsNumberString()
  readonly skip?: string;
}
