import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

type GetFn = (key: string, defaultValue?: any) => any;

function pick(
  get: GetFn,
  primary: string,
  fallback?: string,
  defaultValue?: any,
) {
  const val = get(primary);
  if (val !== undefined && val !== null && val !== '') return val;
  if (fallback) {
    const fb = get(fallback);
    if (fb !== undefined && fb !== null && fb !== '') return fb;
  }
  return defaultValue;
}

function toBool(val: any, defaultValue = false): boolean {
  if (val === undefined || val === null || val === '') return defaultValue;
  if (typeof val === 'boolean') return val;
  const s = String(val)
    .toLowerCase()
    .trim()
    .replace(/^(["'])(.*)\1$/, '$2');
  return ['1', 'true', 'yes', 'y', 'on'].includes(s);
}

function toNumber(val: any, defaultValue?: number): number | undefined {
  if (val === undefined || val === null || val === '') return defaultValue;
  const n = Number(val);
  return Number.isNaN(n) ? defaultValue : n;
}

function buildOptions(get: GetFn): DataSourceOptions {
  const rawType = pick(get, 'DATABASE_TYPE');
  const type =
    rawType != null
      ? String(rawType)
          .trim()
          .replace(/^(\[?)(["'])(.*)\2(\]?)$/, '$3')
          .replace(/^(\"|\')|((\"|\')$)/g, '')
      : undefined;
  return {
    type: type as any,
    host: pick(get, 'DATABASE_HOST', 'DB_HOST') as string,
    port: toNumber(pick(get, 'DATABASE_PORT', 'DB_PORT')) as number,
    username: pick(get, 'DATABASE_USERNAME', 'DB_USERNAME') as string,
    password: pick(get, 'DATABASE_PASSWORD', 'DB_PASSWORD') as string,
    database: pick(get, 'DATABASE_NAME', 'DB_NAME') as string,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    logging: !!pick(
      get,
      'isDev',
      undefined,
      pick(get, 'NODE_ENV') !== 'production',
    ),
    synchronize: toBool(pick(get, 'DATABASE_SYNCRONIZE'), false),
    ssl: { rejectUnauthorized: false },
    maxQueryExecutionTime: toNumber(
      pick(get, 'DB_MAX_QUERY_EXECUTION_TIME'),
      0,
    ),
    migrationsTableName: 'migrations_typeorm',
  } as unknown as DataSourceOptions;
}

// For Nest (TypeOrmModule.forRootAsync)
export const typeOrmModuleFactory = (config: ConfigService) =>
  buildOptions((k: string, d?: any) => config.get(k, d));

// For CLI DataSource (no Nest container)
export const typeOrmCliOptions: DataSourceOptions = buildOptions(
  (k: string, d?: any) => process.env[k] ?? d,
);

// Optional: export a DataSource instance for CLI tools that import a DataSource
export const AppDataSource = new DataSource(typeOrmCliOptions);
