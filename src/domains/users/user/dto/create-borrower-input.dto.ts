import {
  IsEmail,
  IsEnum,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';
import { DocumentType, Country, City } from '../user.entity';

export class CreateBorrowerInput {
  @IsEnum(DocumentType, {
    message: `documentType must be one of ${Object.values(DocumentType).join(
      ', ',
    )}`,
  })
  readonly documentType: string;

  @Length(5, 25)
  @IsNumberString()
  readonly documentNumber: string;

  @Length(5, 160)
  @IsString()
  readonly fullName: string;

  @IsEmail()
  readonly email: string;

  @Length(10, 10)
  @IsNumberString()
  readonly phoneNumber: string;

  @IsEnum(Country, {
    message: `country must be one of ${Object.values(Country).join(', ')}`,
  })
  readonly country: string;

  @IsEnum(City, {
    message: `city must be one of ${Object.values(City).join(', ')}`,
  })
  readonly city: string;

  @Length(5, 160)
  @IsString()
  readonly address: string;

  @Length(6, 16)
  @IsString()
  readonly password: string;
}
