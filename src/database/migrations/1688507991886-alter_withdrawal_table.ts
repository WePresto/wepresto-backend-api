import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterWithdrawalTable1688507991886 implements MigrationInterface {
  name = 'AlterWithdrawalTable1688507991886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "withdrawal" ADD "proof_url" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "withdrawal" DROP COLUMN "proof_url"`);
  }
}
