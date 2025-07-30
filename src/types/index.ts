/**
 * Type definitions for the RudderStack Data Catalog API
 */

import { EventType, PropertyType } from '../constants';

// Re-export auth types
export * from './auth';

// Base entity interface
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Event related types
export interface Event extends BaseEntity {
  name: string;
  type: EventType;
  description: string;
}

export interface CreateEventRequest {
  name: string;
  type: EventType;
  description: string;
}

export interface UpdateEventRequest {
  name?: string;
  type?: EventType;
  description?: string;
}

// Property related types
export interface Property extends BaseEntity {
  name: string;
  type: PropertyType;
  description: string;
  validation_rules?: string | null; // JSON string for validation rules
}

export interface CreatePropertyRequest {
  name: string;
  type: PropertyType;
  description: string;
  validation_rules?: Record<string, any>;
}

export interface UpdatePropertyRequest {
  name?: string;
  type?: PropertyType;
  description?: string;
  validation_rules?: Record<string, any>;
}

// Tracking Plan related types
export interface TrackingPlanEvent {
  name: string;
  description: string;
  properties: TrackingPlanProperty[];
  additionalProperties: boolean;
}

export interface TrackingPlanProperty {
  name: string;
  type: PropertyType;
  required: boolean;
  description: string;
}

export interface TrackingPlan extends BaseEntity {
  name: string;
  description: string;
  events: TrackingPlanEvent[];
}

export interface CreateTrackingPlanRequest {
  name: string;
  description: string;
  events: TrackingPlanEvent[];
}

export interface UpdateTrackingPlanRequest {
  name?: string;
  description?: string;
  events?: TrackingPlanEvent[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database types
export interface DatabaseEvent extends Omit<Event, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
}

export interface DatabaseProperty {
  id: number;
  name: string;
  type: PropertyType;
  description: string;
  validation_rules?: Record<string, any> | null; // PostgreSQL JSONB
  created_at: string;
  updated_at: string;
}

export interface DatabaseTrackingPlan {
  id: number;
  name: string;
  description: string;
  events: TrackingPlanEvent[]; // PostgreSQL JSONB
  created_at: string;
  updated_at: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface EventQueryParams extends PaginationParams {
  type?: EventType;
  search?: string;
}

export interface PropertyQueryParams extends PaginationParams {
  type?: PropertyType;
  search?: string;
}

export interface TrackingPlanQueryParams extends PaginationParams {
  search?: string;
} 