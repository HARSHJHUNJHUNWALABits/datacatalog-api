/**
 * Database connection configuration using Knex
 */
import knex from 'knex';
import config from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

export const db = knex(dbConfig);

export default db; 