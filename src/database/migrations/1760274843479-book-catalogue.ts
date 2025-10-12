import { MigrationInterface, QueryRunner } from "typeorm";

export class BookCatalogue1760274843479 implements MigrationInterface {
    name = 'BookCatalogue1760274843479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_categories_enum" AS ENUM('Islamic Books', 'Motivational Books', 'Business Books', 'Design Books', 'Final Year Project')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_type_enum" AS ENUM('Physical', 'Digital')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_fileformat_enum" AS ENUM('PDF', 'EPUB')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_faculty_enum" AS ENUM('Faculty of Agriculture', 'Faculty of Arts', 'Faculty of Basic Medical Science', 'Faculty of Clinical Science', 'Faculty of Dentistry', 'Faculty of Economics and Management Science', 'Faculty of Environmental Design and Management', 'Faculty of Law', 'Faculty of Pharmacy', 'Faculty of Public Health', 'Faculty of Renewable Natural Resources', 'Faculty of Science', 'Faculty of Social Science', 'Faculty of Computing', 'Faculty of Technology', 'Faculty of Veterinary Medicine')`);
        await queryRunner.query(`CREATE TABLE "tbl_book_catalogues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying(255) NOT NULL, "author" character varying(255) NOT NULL, "categories" "public"."tbl_book_catalogues_categories_enum" array NOT NULL, "type" "public"."tbl_book_catalogues_type_enum" NOT NULL, "description" text NOT NULL, "coverImage" character varying(255) NOT NULL, "fileUrl" character varying(255) NOT NULL, "fileFormat" "public"."tbl_book_catalogues_fileformat_enum" NOT NULL, "projectLink" character varying(255), "faculty" "public"."tbl_book_catalogues_faculty_enum", "isAvailable" boolean DEFAULT true, "isLibrarianPick" boolean DEFAULT false, CONSTRAINT "PK_102186223b2ab3aee64785372d4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tbl_book_catalogues"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_faculty_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_fileformat_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_categories_enum"`);
    }

}
