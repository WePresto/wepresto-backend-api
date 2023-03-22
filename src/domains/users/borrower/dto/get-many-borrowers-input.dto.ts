import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetManyBorrowersInput {
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @IsOptional()
  @IsString()
  readonly documentNumber?: string;

  @IsOptional()
  @IsNumberString()
  readonly take?: string;

  @IsOptional()
  @IsNumberString()
  readonly skip?: string;
}
