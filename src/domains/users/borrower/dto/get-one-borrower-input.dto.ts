import { IsUUID } from 'class-validator';

export class GetOneBorrowerInput {
  @IsUUID()
  uid: string;
}
