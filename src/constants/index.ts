/**
 * Application constants for the RudderStack Data Catalog API
 */

export const EVENT_TYPES = ['track', 'identify', 'alias', 'screen', 'page'] as const;
export type EventType = typeof EVENT_TYPES[number];

export const PROPERTY_TYPES = ['string', 'number', 'boolean'] as const;
export type PropertyType = typeof PROPERTY_TYPES[number];

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  EVENT_NOT_FOUND: 'Event not found',
  PROPERTY_NOT_FOUND: 'Property not found',
  TRACKING_PLAN_NOT_FOUND: 'Tracking plan not found',
  EVENT_ALREADY_EXISTS: 'Event with this name and type already exists',
  PROPERTY_ALREADY_EXISTS: 'Property with this name and type already exists',
  TRACKING_PLAN_ALREADY_EXISTS: 'Tracking plan with this name already exists',
  INVALID_EVENT_TYPE: 'Invalid event type. Must be one of: track, identify, alias, screen, page',
  INVALID_PROPERTY_TYPE: 'Invalid property type. Must be one of: string, number, boolean',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
} as const;

export const DATABASE_CONFIG = {
  CLIENT: 'pg',
  USE_NULL_AS_DEFAULT: false,
  MIGRATIONS: {
    DIRECTORY: './src/database/migrations',
  },
  SEEDS: {
    DIRECTORY: './src/database/seeds',
  },
} as const;

export const API_ENDPOINTS = {
  EVENTS: 'events',
  PROPERTIES: 'properties',
  TRACKING_PLANS: 'tracking-plans',
  HEALTH: '/health',
  DOCS: '/docs',
} as const;

export const VALIDATION_RULES = {
  NAME_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
  TRACKING_PLAN_NAME_MAX_LENGTH: 255,
} as const; 