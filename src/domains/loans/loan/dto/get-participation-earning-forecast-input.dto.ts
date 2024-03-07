import { IsNumberString, IsString } from 'class-validator';

export class GetParticipationEarningForecastInput {
  @IsString()
  readonly loanUid: string;

  @IsNumberString()
  readonly participationAmount: string;
}
