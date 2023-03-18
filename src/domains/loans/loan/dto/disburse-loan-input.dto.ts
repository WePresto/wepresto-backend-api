import { IsUUID, IsOptional, IsString } from 'class-validator';

export class DisburseLoanInput {
  @IsUUID()
  readonly uid: string;

  @IsOptional()
  @IsString()
  readonly comment?: string;
}
