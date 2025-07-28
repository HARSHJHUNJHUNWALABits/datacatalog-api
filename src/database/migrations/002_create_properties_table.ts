/**
 * Migration: Create properties table
 */
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('properties', (table: Knex.CreateTableBuilder) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.enum('type', ['string', 'number', 'boolean']).notNullable();
    table.text('description').notNullable();
    table.jsonb('validation_rules').nullable();
    table.timestamps(true, true);
    table.unique(['name', 'type']);
    table.index(['name']);
    table.index(['type']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('properties');
} 