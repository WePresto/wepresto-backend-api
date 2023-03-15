import { MigrationInterface, QueryRunner } from 'typeorm';

export class initialMigration1678892743491 implements MigrationInterface {
  name = 'initialMigration1678892743491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "movement" ("id" SERIAL NOT NULL, "uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(50) NOT NULL, "amount" numeric(15,3) NOT NULL, "interest_amount" numeric(15,3) NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "paid" boolean, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "loan_id" integer NOT NULL, CONSTRAINT "uk_movement_uid" UNIQUE ("uid"), CONSTRAINT "PK_079f005d01ebda984e75c2d67ee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "loan" ("id" SERIAL NOT NULL, "uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(15,3) NOT NULL, "annual_interest_rate" numeric(5,3) NOT NULL, "annual_interest_overdue_rate" numeric(5,3) NOT NULL, "loan_term" integer NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "paid" boolean NOT NULL DEFAULT false, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "borrower_id" integer, CONSTRAINT "uk_loan_uid" UNIQUE ("uid"), CONSTRAINT "PK_4ceda725a323d254a5fd48bf95f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "borrower" ("id" SERIAL NOT NULL, "uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "uk_borrower_uid" UNIQUE ("uid"), CONSTRAINT "REL_3e8d995384f97fb4454ca621cc" UNIQUE ("user_id"), CONSTRAINT "PK_c9737036f657d00897e09029378" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "auth_uid" character varying(100), "document_number" character varying(20), "full_name" character varying(160), "email" character varying(100), "phone_number" character varying(13), "address" character varying(100), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uk_user_auth_uid" UNIQUE ("auth_uid"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "lender" ("id" SERIAL NOT NULL, "uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "uk_lender_uid" UNIQUE ("uid"), CONSTRAINT "REL_acab8a2ccacc07f7dabc9c3747" UNIQUE ("user_id"), CONSTRAINT "PK_8cb68b42ba3dd99084822711855" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "loan_participation" ("id" SERIAL NOT NULL, "uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(15,3) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lender_id" integer, "loan_id" integer, CONSTRAINT "uk_loan_participation_uid" UNIQUE ("uid"), CONSTRAINT "PK_ff188201ac33cd1822c6a354b43" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "loan_request" ("id" SERIAL NOT NULL, "uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(15,3) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "borrower_id" integer, CONSTRAINT "uk_loan_request_uid" UNIQUE ("uid"), CONSTRAINT "PK_11781d1e7f2d3bdfa8602557a98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" ADD CONSTRAINT "FK_a79e55dc0161bd0336206881533" FOREIGN KEY ("loan_id") REFERENCES "loan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ADD CONSTRAINT "FK_c96fb603d6c2ef272f16c98369d" FOREIGN KEY ("borrower_id") REFERENCES "borrower"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrower" ADD CONSTRAINT "FK_3e8d995384f97fb4454ca621ccf" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lender" ADD CONSTRAINT "FK_acab8a2ccacc07f7dabc9c3747b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_participation" ADD CONSTRAINT "FK_427945e18b2f8756bfe732b882f" FOREIGN KEY ("lender_id") REFERENCES "lender"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_participation" ADD CONSTRAINT "FK_6fda16e7ee3a07c7f00c998ccab" FOREIGN KEY ("loan_id") REFERENCES "loan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_request" ADD CONSTRAINT "FK_e737c9498d7db3c48746d9195c9" FOREIGN KEY ("borrower_id") REFERENCES "borrower"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan_request" DROP CONSTRAINT "FK_e737c9498d7db3c48746d9195c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_participation" DROP CONSTRAINT "FK_6fda16e7ee3a07c7f00c998ccab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_participation" DROP CONSTRAINT "FK_427945e18b2f8756bfe732b882f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lender" DROP CONSTRAINT "FK_acab8a2ccacc07f7dabc9c3747b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrower" DROP CONSTRAINT "FK_3e8d995384f97fb4454ca621ccf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" DROP CONSTRAINT "FK_c96fb603d6c2ef272f16c98369d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" DROP CONSTRAINT "FK_a79e55dc0161bd0336206881533"`,
    );
    await queryRunner.query(`DROP TABLE "loan_request"`);
    await queryRunner.query(`DROP TABLE "loan_participation"`);
    await queryRunner.query(`DROP TABLE "lender"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "borrower"`);
    await queryRunner.query(`DROP TABLE "loan"`);
    await queryRunner.query(`DROP TABLE "movement"`);
  }
}
