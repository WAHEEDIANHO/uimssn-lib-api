import { Column, Entity } from 'typeorm';
import { BookCatalogueCategoriesEnum } from '../enums/book-catalogue-categories..enum';
import { BookCatalogueTypeEnum } from '../enums/book-catalogue-type.enum';
import { BookCatalogueFileFormatEnum } from '../enums/book-catalogue-file-format';
import { FacultyEnum } from '../enums/faculty.enum';
import { DbEntity } from '@uimssn/base_module/utils/abstract/database/db-entity';
import { IEntity } from '@uimssn/base_module/utils/abstract/database/i-enity';

@Entity('tbl_book_catalogues')
export class BookCatalogue extends DbEntity implements IEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  author: string;

  @Column({ type: 'enum', enum: BookCatalogueCategoriesEnum, array: true, nullable: false })
  categories: BookCatalogueCategoriesEnum[];

  @Column({ type: 'jsonb', default:'[]', nullable: false })
  type: BookCatalogueTypeEnum;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  coverImage: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  fileUrl: string;

  @Column({ type: 'enum', enum: BookCatalogueFileFormatEnum, nullable: false })
  fileFormat: BookCatalogueFileFormatEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  projectLink: string;

  @Column({ type: 'enum', enum: FacultyEnum, nullable: true })
  faculty: FacultyEnum;

  @Column({ type: 'boolean', nullable: true, default: true })
  isAvailable: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  isLibrarianPick: boolean;
}
