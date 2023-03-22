import {
  IsEmail,
  IsEnum,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType, Country, City } from '../user.entity';

export class CreateBorrowerInput {
  @ApiProperty({
    enum: Object.values(DocumentType),
  })
  @IsEnum(DocumentType, {
    message: `documentType must be one of ${Object.values(DocumentType).join(
      ', ',
    )}`,
  })
  readonly documentType: string;

  @ApiProperty({
    example: '1234567890',
  })
  @Length(5, 25)
  @IsNumberString()
  readonly documentNumber: string;

  @ApiProperty({
    example: 'John Doe',
  })
  @Length(5, 160)
  @IsString()
  readonly fullName: string;

  @ApiProperty({
    example: 'john_doe@test.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '1234567890',
  })
  @Length(10, 10)
  @IsNumberString()
  readonly phoneNumber: string;

  @ApiProperty({
    enum: Object.values(Country),
  })
  @IsEnum(Country, {
    message: `country must be one of ${Object.values(Country).join(', ')}`,
  })
  readonly country: string;

  @ApiProperty({
    enum: Object.values(City),
  })
  @IsEnum(City, {
    message: `city must be one of ${Object.values(City).join(', ')}`,
  })
  readonly city: string;

  @ApiProperty({
    example: 'Cra 123 # 45 - 67',
  })
  @Length(5, 160)
  @IsString()
  readonly address: string;

  @ApiProperty({
    example: 'h3h3_1234',
  })
  @Length(6, 25)
  @IsString()
  readonly password: string;
}
