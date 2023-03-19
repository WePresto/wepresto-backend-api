import { IsUUID } from 'class-validator';

export class GetOneMovementInput {
  @IsUUID()
  uid: string;
}
