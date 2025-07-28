/**
 * Interface for Event repository operations
 * Follows SOLID principles - Interface Segregation Principle
 */
import { Event, CreateEventRequest, UpdateEventRequest, EventQueryParams, PaginatedResponse } from '../../types';

export interface IEventRepository {
  /**
   * Create a new event
   * @param eventData - Event data to create
   * @returns Promise<Event> - Created event
   */
  create(eventData: CreateEventRequest): Promise<Event>;

  /**
   * Find event by ID
   * @param id - Event ID
   * @returns Promise<Event | null> - Found event or null
   */
  findById(id: number): Promise<Event | null>;

  /**
   * Find event by name and type
   * @param name - Event name
   * @param type - Event type
   * @returns Promise<Event | null> - Found event or null
   */
  findByNameAndType(name: string, type: string): Promise<Event | null>;

  /**
   * Get all events with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<Event>> - Paginated events
   */
  findAll(params: EventQueryParams): Promise<PaginatedResponse<Event>>;

  /**
   * Update an existing event
   * @param id - Event ID
   * @param eventData - Event data to update
   * @returns Promise<Event | null> - Updated event or null if not found
   */
  update(id: number, eventData: UpdateEventRequest): Promise<Event | null>;

  /**
   * Delete an event by ID
   * @param id - Event ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  delete(id: number): Promise<boolean>;

  /**
   * Check if event exists by name and type
   * @param name - Event name
   * @param type - Event type
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  existsByNameAndType(name: string, type: string): Promise<boolean>;
} 