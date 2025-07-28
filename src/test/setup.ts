/**
 * Test setup configuration
 */
import { db } from '../database/connection';

// Global test setup
beforeAll(async () => {
  // Run migrations for test database
  await db.migrate.latest();
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await db.destroy();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data
  await db('tracking_plans').del();
  await db('properties').del();
  await db('events').del();
}); 