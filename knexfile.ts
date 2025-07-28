import { Knex } from 'knex';
import { DATABASE_CONFIG } from './src/constants';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: DATABASE_CONFIG.CLIENT,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rudderstack_data_catalog_dev',
    },
    useNullAsDefault: DATABASE_CONFIG.USE_NULL_AS_DEFAULT,
    migrations: {
      directory: DATABASE_CONFIG.MIGRATIONS.DIRECTORY,
    },
    seeds: {
      directory: DATABASE_CONFIG.SEEDS.DIRECTORY,
    },
  },

  test: {
    client: DATABASE_CONFIG.CLIENT,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME_TEST || 'rudderstack_data_catalog_test',
    },
    useNullAsDefault: DATABASE_CONFIG.USE_NULL_AS_DEFAULT,
    migrations: {
      directory: DATABASE_CONFIG.MIGRATIONS.DIRECTORY,
    },
    seeds: {
      directory: DATABASE_CONFIG.SEEDS.DIRECTORY,
    },
  },

  production: {
    client: DATABASE_CONFIG.CLIENT,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rudderstack_data_catalog_prod',
    },
    useNullAsDefault: DATABASE_CONFIG.USE_NULL_AS_DEFAULT,
    migrations: {
      directory: DATABASE_CONFIG.MIGRATIONS.DIRECTORY,
    },
    seeds: {
      directory: DATABASE_CONFIG.SEEDS.DIRECTORY,
    },
  },
};

export default config; 