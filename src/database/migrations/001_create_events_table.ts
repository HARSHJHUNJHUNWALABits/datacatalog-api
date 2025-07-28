/**
 * Migration: Create events table
 */
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('events', (table: Knex.CreateTableBuilder) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.enum('type', ['track', 'identify', 'alias', 'screen', 'page']).notNullable();
    table.text('description').notNullable();
    table.timestamps(true, true);
    table.unique(['name', 'type']);
    table.index(['name']);
    table.index(['type']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('events');
} 