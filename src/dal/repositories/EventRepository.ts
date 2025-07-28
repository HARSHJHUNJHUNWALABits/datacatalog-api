/**
 * Event repository implementation using Knex
 * Follows SOLID principles - Single Responsibility Principle
 */
import { Knex } from 'knex';
import { IEventRepository } from '../interfaces/IEventRepository';
import { Event, CreateEventRequest, UpdateEventRequest, EventQueryParams, PaginatedResponse, DatabaseEvent } from '../../types';
import { VALIDATION_RULES } from '../../constants';

export class EventRepository implements IEventRepository {
  constructor(private readonly db: Knex) {}

  /**
   * Create a new event
   * @param eventData - Event data to create
   * @returns Promise<Event> - Created event
   */
  async create(eventData: CreateEventRequest): Promise<Event> {
    const [event] = await this.db('events')
      .insert({
        name: eventData.name,
        type: eventData.type,
        description: eventData.description,
      })
      .returning('*');

    return this.mapDatabaseEventToEvent(event);
  }

  /**
   * Find event by ID
   * @param id - Event ID
   * @returns Promise<Event | null> - Found event or null
   */
  async findById(id: number): Promise<Event | null> {
    const event = await this.db('events')
      .where({ id })
      .first();

    return event ? this.mapDatabaseEventToEvent(event) : null;
  }

  /**
   * Find event by name and type
   * @param name - Event name
   * @param type - Event type
   * @returns Promise<Event | null> - Found event or null
   */
  async findByNameAndType(name: string, type: string): Promise<Event | null> {
    const event = await this.db('events')
      .where({ name, type })
      .first();

    return event ? this.mapDatabaseEventToEvent(event) : null;
  }

  /**
   * Get all events with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<Event>> - Paginated events
   */
  async findAll(params: EventQueryParams): Promise<PaginatedResponse<Event>> {
    const { page = 1, limit = 10, type, search } = params;
    const offset = (page - 1) * limit;

    let query = this.db('events');

    // Apply filters
    if (type) {
      query = query.where({ type });
    }

    if (search) {
      query = query.where(function(this: any) {
        this.where('name', 'like', `%${search}%`)
          .orWhere('description', 'like', `%${search}%`);
      });
    }

    // Get total count
    const [{ count }] = await query.clone().count('* as count');
    const total = Number(count);

    // Get paginated results
    const events = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: events.map((event: any) => this.mapDatabaseEventToEvent(event)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update an existing event
   * @param id - Event ID
   * @param eventData - Event data to update
   * @returns Promise<Event | null> - Updated event or null if not found
   */
  async update(id: number, eventData: UpdateEventRequest): Promise<Event | null> {
    const updateData: Partial<DatabaseEvent> = {};
    
    if (eventData.name !== undefined) updateData.name = eventData.name;
    if (eventData.type !== undefined) updateData.type = eventData.type;
    if (eventData.description !== undefined) updateData.description = eventData.description;

    const [event] = await this.db('events')
      .where({ id })
      .update(updateData)
      .returning('*');

    return event ? this.mapDatabaseEventToEvent(event) : null;
  }

  /**
   * Delete an event by ID
   * @param id - Event ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const deletedRows = await this.db('events')
      .where({ id })
      .del();

    return deletedRows > 0;
  }

  /**
   * Check if event exists by name and type
   * @param name - Event name
   * @param type - Event type
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  async existsByNameAndType(name: string, type: string): Promise<boolean> {
    const event = await this.db('events')
      .where({ name, type })
      .first();

    return !!event;
  }

  /**
   * Map database event to domain event
   * @param dbEvent - Database event object
   * @returns Event - Domain event object
   */
  private mapDatabaseEventToEvent(dbEvent: DatabaseEvent): Event {
    return {
      id: dbEvent.id,
      name: dbEvent.name,
      type: dbEvent.type,
      description: dbEvent.description,
      created_at: dbEvent.created_at,
      updated_at: dbEvent.updated_at,
    };
  }
} 