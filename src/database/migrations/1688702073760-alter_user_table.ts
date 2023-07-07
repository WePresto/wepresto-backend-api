import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserTable1688702073760 implements MigrationInterface {
  name = 'AlterUserTable1688702073760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "fcm_token" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "fcm_token"`);
  }
}
