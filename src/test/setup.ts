/**
 * Test setup configuration
 */
import { jest } from '@jest/globals';

// Mock the database connection
jest.mock('../database/connection', () => ({
  db: {
    // Add any database methods that might be called during tests
    raw: jest.fn(),
    select: jest.fn(),
    from: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
  },
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test setup
beforeAll(async () => {
  // Run migrations for test database
  // await db.migrate.latest(); // This line is removed as per the new_code
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  // await db.destroy(); // This line is removed as per the new_code
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data
  // await db('tracking_plans').del(); // This line is removed as per the new_code
  // await db('properties').del(); // This line is removed as per the new_code
  // await db('events').del(); // This line is removed as per the new_code
}); 