import { MigrationInterface, QueryRunner } from "typeorm";

export class BookRequest1775341106622 implements MigrationInterface {
    name = 'BookRequest1775341106622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_requests_faculty_enum" AS ENUM('Faculty of Agriculture', 'Faculty of Arts', 'Faculty of Basic Medical Science', 'Faculty of Clinical Science', 'Faculty of Dentistry', 'Faculty of Economics and Management Science', 'Faculty of Environmental Design and Management', 'Faculty of Law', 'Faculty of Pharmacy', 'Faculty of Public Health', 'Faculty of Renewable Natural Resources', 'Faculty of Science', 'Faculty of Social Science', 'Faculty of Computing', 'Faculty of Technology', 'Faculty of Veterinary Medicine')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_requests_status_enum" AS ENUM('pending', 'approved', 'declined', 'returned', 'fulfilled')`);
        await queryRunner.query(`CREATE TABLE "tbl_book_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "fullName" character varying NOT NULL, "whatsAppNumber" character varying NOT NULL, "matricNo" integer NOT NULL, "faculty" "public"."tbl_book_requests_faculty_enum" NOT NULL, "department" character varying NOT NULL, "reason" text NOT NULL, "status" "public"."tbl_book_requests_status_enum" NOT NULL DEFAULT 'pending', "bookId" uuid, CONSTRAINT "PK_0c4919838987522c1592f3009a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_504b2f867fb60556a3f23b1999" ON "tbl_book_requests" ("bookId", "matricNo", "status") `);
        await queryRunner.query(`ALTER TABLE "tbl_book_requests" ADD CONSTRAINT "FK_50348157765b05f5d9995539c51" FOREIGN KEY ("bookId") REFERENCES "tbl_book_catalogues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_book_requests" DROP CONSTRAINT "FK_50348157765b05f5d9995539c51"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_504b2f867fb60556a3f23b1999"`);
        await queryRunner.query(`DROP TABLE "tbl_book_requests"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_requests_faculty_enum"`);
    }

}
