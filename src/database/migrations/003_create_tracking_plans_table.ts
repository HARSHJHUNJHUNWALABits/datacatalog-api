/**
 * Migration: Create tracking plans table
 */
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tracking_plans', (table: Knex.CreateTableBuilder) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable().unique();
    table.text('description').notNullable();
    table.jsonb('events').notNullable();
    table.timestamps(true, true);
    table.index(['name']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tracking_plans');
} 