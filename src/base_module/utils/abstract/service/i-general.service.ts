import { IEntity } from '@uimssn/base_module/utils/abstract/database/i-enity';
import { PaginationQueryDto } from '@uimssn/base_module/utils/dto/pagination-query.dto';
import { PaginatedResultDto } from '@uimssn/base_module/utils/dto/paginated-result.dto';

export interface IGeneralService<T extends IEntity> {
  create(data: T): Promise<boolean>;
  delete(id: string): Promise<boolean>
  update (data: T): void;
  findAll(
    // limit?: number,
    // cursor?: string,
    // cursorField?: keyof T,
    // order?: 'ASC' | 'DESC',
    // filters?: FindOptionsWhere<T>,
    paginationReqDto: PaginationQueryDto<T>,
    relations?: string[],
  ): Promise<PaginatedResultDto<T>>;
  findById(id: string | number): Promise<T|null>;
  // async saveAsync(mentor: Mentor): Promise<void> {

}