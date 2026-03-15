import { FindOptionsWhere, Repository } from 'typeorm';
import { IEntity } from '@uimssn/base_module/utils/abstract/database/i-enity';
import { IGeneralService } from '@uimssn/base_module/utils/abstract/service/i-general.service';
import { PaginationQueryDto } from '@uimssn/base_module/utils/dto/pagination-query.dto';
import { PaginatedResultDto } from '@uimssn/base_module/utils/dto/paginated-result.dto';

export class GeneralService<T extends IEntity> implements IGeneralService<T> {
  constructor(private readonly repository: Repository<T>) {}

  async create(data: T): Promise<T> {
    return this.repository.save(data);
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.repository.delete(id);
    return (res.affected as number) > 0;
  }

  async softDelete(id: string): Promise<boolean> {
    const res = await this.repository.softDelete(id);
    return (res.affected as number) > 0;
  }

  async update(data: T): Promise<T> {
    return await this.repository.save(data);
  }

  async findAll<K extends PaginationQueryDto<T>>(
    paginationReqDto: K,
    relations: string[] = [],
  ): Promise<PaginatedResultDto<T>> {
    const {
      limit = 10,
      page,
      cursor,
      cursorField = 'id',
      order = 'DESC',
      q: qTerm,
      searchFields: searchFieldsRaw,
    } = paginationReqDto;

    ['cursor', 'limit', 'order', 'cursorField', 'page', 'q', 'searchFields'].forEach(
      (key) => delete (paginationReqDto as any)[key],
    );

    

    const isPageMode = typeof page === 'number' && page >= 1;

    const field = String(cursorField);

    const query = this.repository
      .createQueryBuilder('entity')
      .orderBy(`entity.${field}`, order);

    // Apply pagination strategy
    if (isPageMode) {
      const offset = (page - 1) * +limit;
      query.skip(offset).take(+limit);
    } else {
      query.take(+limit + 1);
    }

    // Support nested relations like 'organization.role' by joining stepwise
    const joinedAliases = new Set<string>();
    relations.forEach((relation) => {
      const parts = String(relation).split('.').filter(Boolean);
      let parentAlias = 'entity';
      for (const part of parts) {
        const alias = part;
        const path = `${parentAlias}.${part}`;
        if (!joinedAliases.has(alias)) {
          query.leftJoinAndSelect(path, alias);
          joinedAliases.add(alias);
        }
        parentAlias = alias;
      }
    });

    if (!isPageMode && cursor) {
      query.andWhere(`entity.${field} = :cursor`, { cursor });
    }

    const parseValue = (raw: any) => {
      if (raw === 'null') return { operator: 'IS', value: null };
      if (raw === 'all') return { operator: null, value: null }; // skip this field
      if (typeof raw !== 'string') return { operator: '=', value: raw };

      // Case-insensitive like
      if (raw.startsWith('like:'))
        return { operator: 'ILIKE', value: `%${raw.slice(5)}%` };

      // NOT IN support: notIn:, NOT_IN:, NOT IN:, and bracket syntax e.g. NOT_IN['a','b']
      const lower = raw.toLowerCase();
      if (lower.startsWith('notin:') || lower.startsWith('not_in:') || lower.startsWith('not in:')) {
        const payload = raw.split(':', 2)[1] ?? '';
        try {
          const arr = JSON.parse(payload);
          return { operator: 'NOT_IN', value: Array.isArray(arr) ? arr : [arr] };
        } catch {
          const items = payload.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
          return { operator: 'NOT_IN', value: items };
        }
      }

      const notInBracketMatch = raw.match(/^not[_\s]?in\s*\[(.*)\]\s*$/i);
      if (notInBracketMatch) {
        const inner = notInBracketMatch[1] ?? '';
        const items = inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
        return { operator: 'NOT_IN', value: items };
      }

      // Array operators for Postgres arrays
      if (raw.startsWith('arrAny:')) {
        try {
          const arr = JSON.parse(raw.slice(7));
          return {
            operator: 'ARR_ANY',
            value: Array.isArray(arr) ? arr : [arr],
          };
        } catch {
          return { operator: 'ARR_ANY', value: raw.slice(7).split(',') };
        }
      }
      if (raw.startsWith('arrAll:')) {
        try {
          const arr = JSON.parse(raw.slice(7));
          return {
            operator: 'ARR_ALL',
            value: Array.isArray(arr) ? arr : [arr],
          };
        } catch {
          return { operator: 'ARR_ALL', value: raw.slice(7).split(',') };
        }
      }

      if (raw.startsWith('in:')) {
        try {
          const arr = JSON.parse(raw.slice(3));
          return { operator: 'IN', value: Array.isArray(arr) ? arr : [arr] };
        } catch {
          return { operator: 'IN', value: raw.slice(3).split(',') };
        }
      }

      const match = raw.match(/^([<>]=?|=)(.+)$/);
      if (match) return { operator: match[1], value: match[2].trim() };

      return { operator: '=', value: raw };
    };

    // Global search q across fields using ILIKE
    // const qTerm = (paginationReqDto as any).q?.toString().trim();

    if (qTerm) {
      const searchFields = (
        searchFieldsRaw
          ? searchFieldsRaw.split(',')
          : ['description', 'name']
      )
        .map((f: string) => f.trim())
        .filter(Boolean);

      const entityColumns = new Set(
        this.repository.metadata.columns.map((c) => c.propertyName),
      );

      const simpleFields = searchFields.filter((f) => !f.includes('.'));
      const nestedFields = searchFields.filter((f) => f.includes('.'));

      const safeSimpleFields = simpleFields.filter((f) =>
        entityColumns.has(f),
      );

      const orQuery: {
        clause: string;
        paramKey: string;
        paramValue: string;
      }[] = [];

      let paramIndex = 0;

      safeSimpleFields.forEach((f: string) => {
        const paramKey = `q_${paramIndex++}`;
        orQuery.push({
          clause: `entity.${f} ILIKE :${paramKey}`,
          paramKey,
          paramValue: `%${qTerm}%`,
        });
      });

      nestedFields.forEach((fieldPath: string) => {
        const parts = fieldPath.split('.').filter(Boolean);
        if (parts.length !== 2) return;
        const [alias, column] = parts;
        if (!joinedAliases.has(alias)) return;

        const paramKey = `q_${paramIndex++}`;
        orQuery.push({
          clause: `${alias}.${column} ILIKE :${paramKey}`,
          paramKey,
          paramValue: `%${qTerm}%`,
        });
      });

      if (orQuery.length) {
        query.andWhere(
          `(` + orQuery.map((q) => q.clause).join(' OR ') + `)`,
          Object.fromEntries(
            orQuery.map((q) => [q.paramKey, q.paramValue]),
          ) as any,
        );
      }

      delete (paginationReqDto as any).q;
      delete (paginationReqDto as any).searchFields;
    }

    const flatFilter = this.flattenFilters(paginationReqDto);

    // 🔥 Handle OR conditions
    const orRaw = flatFilter.or || flatFilter.$or;
    if (orRaw) {
      const orConditions = Array.isArray(orRaw) ? orRaw : [orRaw];

      const orQuery = orConditions.map((cond, i) => {
        const [fieldPath, valRaw] = cond.split('=');
        const { operator, value } = parseValue(valRaw);
        const paramKey = `or_param_${i}`;

        const parts = fieldPath.split('.');
        let clause: string;

        if (parts.length === 2) {
          const [relation, field] = parts;

          // Auto join relation if not already joined
          if (!relations.includes(relation)) {
            relations.push(relation);
            query.leftJoinAndSelect(`entity.${relation}`, relation);
          }

          if (operator === 'ARR_ANY') {
            clause = `${relation}.${field} && :${paramKey}`;
          } else if (operator === 'ARR_ALL') {
            clause = `${relation}.${field} @> :${paramKey}`;
          } else {
            clause = `${relation}.${field} ${operator} :${paramKey}`;
          }
        } else {
          if (operator === 'ARR_ANY') {
            clause = `entity.${fieldPath} && :${paramKey}`;
          } else if (operator === 'ARR_ALL') {
            clause = `entity.${fieldPath} @> :${paramKey}`;
          } else {
            clause = `entity.${fieldPath} ${operator} :${paramKey}`;
          }
        }

        return {
          clause,
          paramKey,
          paramValue: value,
        };
      });

      const orSql = orQuery.map((q) => q.clause).join(' OR ');
      const orParams = Object.fromEntries(
        orQuery.map((q) => [q.paramKey, q.paramValue]),
      );

      query.andWhere(`(${orSql})`, orParams);

      delete flatFilter.or;
      delete flatFilter.$or;
    }

    // Process remaining filters with support for arrays of comparison expressions
    Object.entries(flatFilter).forEach(([key, raw]) => {
      // If this key was consumed earlier (e.g., or/$or), skip
      if (key === 'or' || key === '$or') return;

      const baseParamKey = key.replace(/\./g, '_');

      // Helper to apply a single condition for relation or root column
      const applyCondition = (relation: string | null, field: string, operator: string, value: any, pKey: string) => {
        if (relation) {
          if (!relations.includes(relation)) {
            relations.push(relation);
            query.leftJoinAndSelect(`entity.${relation}`, relation);
          }

          if (operator === 'IS' && value === null) {
            query.andWhere(`${relation}.${field} IS NULL`);
          } else if (operator === 'IN') {
            query.andWhere(`${relation}.${field} IN (:...${pKey})`, { [pKey]: value });
          } else if (operator === 'NOT_IN') {
            query.andWhere(`${relation}.${field} NOT IN (:...${pKey})`, { [pKey]: value });
          } else if (operator === 'ARR_ANY') {
            query.andWhere(`${relation}.${field} && :${pKey}`, { [pKey]: value });
          } else if (operator === 'ARR_ALL') {
            query.andWhere(`${relation}.${field} @> :${pKey}`, { [pKey]: value });
          } else if (operator === null) {
            // skip
          } else if (operator === 'ILIKE') {
            query.andWhere(`${relation}.${field} ILIKE :${pKey}`, { [pKey]: value });
          } else {
            query.andWhere(`${relation}.${field} ${operator} :${pKey}`, { [pKey]: value });
          }
        } else {
          if (operator === 'IS' && value === null) {
            query.andWhere(`entity.${key} IS NULL`);
          } else if (operator === 'IN') {
            query.andWhere(`entity.${key} IN (:...${pKey})`, { [pKey]: value });
          } else if (operator === 'NOT_IN') {
            query.andWhere(`entity.${key} NOT IN (:...${pKey})`, { [pKey]: value });
          } else if (operator === 'ARR_ANY') {
            query.andWhere(`entity.${key} && :${pKey}`, { [pKey]: value });
          } else if (operator === 'ARR_ALL') {
            query.andWhere(`entity.${key} @> :${pKey}`, { [pKey]: value });
          } else if (operator === null) {
            // skip
          } else if (operator === 'ILIKE') {
            query.andWhere(`entity.${key} ILIKE :${pKey}`, { [pKey]: value });
          } else {
            query.andWhere(`entity.${key} ${operator} :${pKey}`, { [pKey]: value });
          }
        }
      };

      const parts = key.split('.');
      const relation = parts.length === 2 ? parts[0] : null;
      let field = parts.length === 2 ? parts[1] : key;
      // Support NotIn suffix: e.g., statusNotIn => apply NOT IN on status
      const isNotInSuffix = /notin$/i.test(field);
      if (isNotInSuffix) {
        field = field.replace(/notin$/i, '');
      }

      // New behavior for arrays: split into operator-expressions and plain values
      if (Array.isArray(raw)) {
        const values = raw as any[];
        const isComparisonExpr = (v: any): v is string => {
          if (typeof v !== 'string') return false;
          return /^(>=|<=|>|<|=)/.test(v) || /^like:/i.test(v) || /^in:/i.test(v) || /^arrany:/i.test(v) || /^arrall:/i.test(v) || /^null$/i.test(v) || /^all$/i.test(v);
        };

        const comparisonExprs = values.filter(isComparisonExpr) as string[];
        const plainValues = values.filter((v) => !isComparisonExpr(v));

        // Apply each comparison expression as its own AND predicate
        comparisonExprs.forEach((expr, idx) => {
          const { operator, value } = parseValue(expr);
          if (operator === null) return; // skip
          const pKey = `${baseParamKey}_${idx}`;
          if (operator === 'IN') {
            // Support both JSON array and comma-separated
            let items: any[];
            try {
              if (/^\s*\[.*\]\s*$/.test(String(value))) {
                const parsed = JSON.parse(String(value));
                items = Array.isArray(parsed) ? parsed : [parsed];
              } else {
                items = String(value).split(',').map((s) => s.trim());
              }
            } catch {
              items = String(value).split(',').map((s) => s.trim());
            }
            applyCondition(relation, field, isNotInSuffix ? 'NOT_IN' : 'IN', items, pKey);
          } else if (operator === 'ARR_ANY' || operator === 'ARR_ALL') {
            let items: any[];
            try {
              if (/^\s*\[.*\]\s*$/.test(String(value))) {
                const parsed = JSON.parse(String(value));
                items = Array.isArray(parsed) ? parsed : [parsed];
              } else {
                items = String(value).split(',').map((s) => s.trim());
              }
            } catch {
              items = String(value).split(',').map((s) => s.trim());
            }
            applyCondition(relation, field, operator, items, pKey);
          } else if (operator === 'ILIKE') {
            applyCondition(relation, field, operator, value, pKey);
          } else if (operator === 'IS' && value === null) {
            applyCondition(relation, field, operator, value, pKey);
          } else if (operator === 'ALL') {
            // skip entirely
          } else {
            applyCondition(relation, field, operator, value, pKey);
          }
        });

        // If there are plain values left, treat them as IN (...)
        if (plainValues.length) {
          const pKey = `${baseParamKey}_${comparisonExprs.length}`;
          applyCondition(relation, field, isNotInSuffix ? 'NOT_IN' : 'IN', plainValues, pKey);
        }
        return; // done with this key
      }

      // Non-array: previous behavior with small safety tweaks
      const { operator, value } = parseValue(raw);
      if (operator === null) return; // skip

      const pKey = `${baseParamKey}`;

      if (relation) {
        applyCondition(relation, field, (operator === 'IN' && isNotInSuffix) ? 'NOT_IN' as any : operator as any, value, pKey);
      } else {
        applyCondition(null, field, (operator === 'IN' && isNotInSuffix) ? 'NOT_IN' as any : operator as any, value, pKey);
      }
    });

    // Execute and build result based on pagination mode
    if (isPageMode) {
      const [data, total] = await query.getManyAndCount();
      const pageCount = Math.ceil(total / +limit) || 0;
      const safePage = page ?? 1;
      const hasPreviousPage = safePage > 1 && total > 0;
      const hasNextPage = safePage < pageCount;

      return {
        data,
        hasNextPage,
        hasPreviousPage,
        nextCursor: null,
        previousCursor: null,
        total,
        page: safePage,
        pageCount,
        limit: +limit,
      } as PaginatedResultDto<T>;
    }

    const result = await query.getMany();

    let hasNextPage = false;
    let hasPreviousPage = false;
    let nextCursor: T[keyof T] | null = null;
    let previousCursor: T[keyof T] | null = null;
    let data = result;

    if (order === 'ASC') {
      if (result.length > limit) {
        hasPreviousPage = true;
        data = result.slice(0, limit);
        previousCursor = data[data.length - 1]?.[cursorField] ?? null;
      }
      if (data.length > 0) {
        nextCursor = cursor ? data[0]?.[cursorField] : null;
        hasNextPage = !!cursor;
      }
      data = data.reverse();
    } else {
      if (result.length > limit) {
        hasNextPage = true;
        data = result.slice(0, limit);
        nextCursor = data[data.length - 1]?.[cursorField] ?? null;
      }
      if (data.length > 0) {
        previousCursor = cursor ? data[0]?.[cursorField] : null;
        hasPreviousPage = !!cursor;
      }
    }

    return {
      data,
      hasNextPage,
      hasPreviousPage,
      nextCursor,
      previousCursor,
    };
  }

  async findById(id: any, relations?: string[]): Promise<T | null> {
    return await this.repository.findOne({ where: { id: id }, relations });
  }

  private flattenFilters(obj: any, prefix = ''): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(flat, this.flattenFilters(value, newKey));
      } else {
        flat[newKey] = value;
      }
    }
    return flat;
  }
}