import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ReviewLoanInput {
  @IsUUID()
  readonly uid: string;

  @IsOptional()
  @IsString()
  readonly comment?: string;
}
