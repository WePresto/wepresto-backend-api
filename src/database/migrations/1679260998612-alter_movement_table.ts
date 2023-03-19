import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMovementTable1679260998612 implements MigrationInterface {
  name = 'alterMovementTable1679260998612';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "movement" ADD "processed" boolean`);
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "comment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "delete_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "delete_at"`);
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "comment"`);
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "processed"`);
  }
}
