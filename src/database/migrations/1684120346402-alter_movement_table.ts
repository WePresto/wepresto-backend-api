import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMovementTable1684120346402 implements MigrationInterface {
  name = 'AlterMovementTable1684120346402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "movement" ADD "proof_url" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "proof_url"`);
  }
}
