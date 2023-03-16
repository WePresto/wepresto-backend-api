import { IsUUID } from 'class-validator';

export class GetOneLoanInput {
  @IsUUID()
  uid: string;
}
