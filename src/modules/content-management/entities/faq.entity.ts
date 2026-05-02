import { DbEntity } from "@uimssn/base_module/utils/abstract/database/db-entity";
import { Column, Entity } from "typeorm";


@Entity('tbl_faq')
export class FAQEntity extends DbEntity {
    @Column({ type: 'varchar', length: 255, nullable: false })
    question: string;

    @Column({ type: 'text', nullable: false })
    answer: string;
}   