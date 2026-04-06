import { DbEntity } from "@uimssn/base_module/utils/abstract/database/db-entity";
import { IEntity } from "@uimssn/base_module/utils/abstract/database/i-enity";
import { BookCatalogue } from "@uimssn/modules/book-catalogue/entities/book-catalogue.entity";
import { FacultyEnum } from "@uimssn/modules/book-catalogue/enums/faculty.enum";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { BookRequestStatusEnum } from "../enums/book-request-status.enum";

@Entity('tbl_book_requests')
@Index(['matricNo', 'status'])
export class BookRequest extends DbEntity implements IEntity {

    @ManyToOne(() => BookCatalogue)
    book: BookCatalogue;

    @Column({ type: 'varchar', nullable: false })
    fullName: string;

    @Column({ type: 'varchar', nullable: false })
    whatsAppNumber: string;

    @Column({ type: 'int', nullable: false })
    matricNo: number;

    @Column({ type: 'enum', enum: FacultyEnum, nullable: false })
    faculty: FacultyEnum;

    @Column({ type: 'varchar', nullable: false })
    department: string;

    @Column({ type: 'text', nullable: false })
    reason: string;

    @Column({ type: 'enum', enum: BookRequestStatusEnum, default: BookRequestStatusEnum.Pending })
    status: BookRequestStatusEnum;
}
