import { DbEntity } from "@uimssn/base_module/utils/abstract/database/db-entity";
import { Column, Entity } from "typeorm";
import { InquiryReason, InquiryStatus } from "../enums";
import { FacultyEnum } from "@uimssn/modules/book-catalogue/enums/faculty.enum";


@Entity('tbl_inquiry')
export class InquiryEntity extends DbEntity {
    @Column({ type: 'varchar', length: 100, nullable: false })
    message: string;

    @Column({ type: 'enum', enum: InquiryReason, nullable: false })
    reason: InquiryReason;

    @Column({ type: 'enum', enum: InquiryStatus, default: InquiryStatus.NEW })
    status: InquiryStatus;

    @Column({ type: 'varchar', length: 50, nullable: false })
    fullName: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    phoneNumber: string;

    @Column({ type: 'enum', enum: FacultyEnum, nullable: false })
    faculty: FacultyEnum;

    @Column({ type: 'varchar', nullable: false })
    department: string;

    @Column({ type: 'varchar', length: 6, nullable: false })
    matricNo: string;

}