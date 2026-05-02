import { MigrationInterface, QueryRunner } from "typeorm";

export class TblContentTblRequest1777686763960 implements MigrationInterface {
    name = 'TblContentTblRequest1777686763960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_504b2f867fb60556a3f23b1999"`);
        await queryRunner.query(`CREATE TABLE "tbl_faq" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "question" character varying(255) NOT NULL, "answer" text NOT NULL, CONSTRAINT "PK_b7bdd456788e780a36463ad1b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_inquiry_reason_enum" AS ENUM('book_recommendation', 'research_help', 'technical_support', 'feedback', 'suggestion', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_inquiry_status_enum" AS ENUM('new', 'in_progress', 'closed')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_inquiry_faculty_enum" AS ENUM('Faculty of Agriculture', 'Faculty of Arts', 'Faculty of Basic Medical Science', 'Faculty of Clinical Science', 'Faculty of Dentistry', 'Faculty of Economics and Management Science', 'Faculty of Environmental Design and Management', 'Faculty of Law', 'Faculty of Pharmacy', 'Faculty of Public Health', 'Faculty of Renewable Natural Resources', 'Faculty of Science', 'Faculty of Social Science', 'Faculty of Computing', 'Faculty of Technology', 'Faculty of Veterinary Medicine')`);
        await queryRunner.query(`CREATE TABLE "tbl_inquiry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "message" character varying(100) NOT NULL, "reason" "public"."tbl_inquiry_reason_enum" NOT NULL, "status" "public"."tbl_inquiry_status_enum" NOT NULL DEFAULT 'new', "fullName" character varying(50) NOT NULL, "email" character varying(50), "phoneNumber" character varying(50) NOT NULL, "faculty" "public"."tbl_inquiry_faculty_enum" NOT NULL, "department" character varying NOT NULL, "matricNo" character varying(6) NOT NULL, CONSTRAINT "PK_1e1b2084dd8c21c3a55d6dd64ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9052c4372be1fd6646112b13bf" ON "tbl_book_requests" ("matricNo", "status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9052c4372be1fd6646112b13bf"`);
        await queryRunner.query(`DROP TABLE "tbl_inquiry"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_inquiry_faculty_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_inquiry_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_inquiry_reason_enum"`);
        await queryRunner.query(`DROP TABLE "tbl_faq"`);
        await queryRunner.query(`CREATE INDEX "IDX_504b2f867fb60556a3f23b1999" ON "tbl_book_requests" ("bookId", "matricNo", "status") `);
    }

}
