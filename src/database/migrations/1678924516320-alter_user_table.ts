import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterUserTable1678924516320 implements MigrationInterface {
  name = 'alterUserTable1678924516320';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "document_type" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "country" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "city" character varying(20)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "document_type"`);
  }
}
