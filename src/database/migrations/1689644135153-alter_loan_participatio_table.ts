import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLoanParticipatioTable1689644135153
  implements MigrationInterface
{
  name = 'AlterLoanParticipatioTable1689644135153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan_participation" ADD "proof_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan_participation" DROP COLUMN "proof_url"`,
    );
  }
}
