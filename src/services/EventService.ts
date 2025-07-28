/**
 * Event service for business logic operations
 * Follows SOLID principles - Single Responsibility Principle
 */
import { IEventRepository } from '../dal/interfaces/IEventRepository';
import { Event, CreateEventRequest, UpdateEventRequest, EventQueryParams, PaginatedResponse, ApiResponse } from '../types';
import { validateEvent } from '../utils/validation';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '../constants';

export class EventService {
  constructor(private readonly eventRepository: IEventRepository) {}

  /**
   * Create a new event
   * @param eventData - Event data to create
   * @returns Promise<ApiResponse<Event>> - API response with created event
   */
  async createEvent(eventData: CreateEventRequest): Promise<ApiResponse<Event>> {
    try {
      // Validate input data
      const validation = validateEvent(eventData);
      if (!validation.isValid) {
        return {
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          message: validation.errors.map(err => `${err.field}: ${err.message}`).join(', '),
        };
      }

      // Check if event already exists
      const existingEvent = await this.eventRepository.findByNameAndType(eventData.name, eventData.type);
      if (existingEvent) {
        return {
          success: false,
          error: ERROR_MESSAGES.EVENT_ALREADY_EXISTS,
        };
      }

      // Create event
      const event = await this.eventRepository.create(eventData);

      return {
        success: true,
        data: event,
        message: 'Event created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get event by ID
   * @param id - Event ID
   * @returns Promise<ApiResponse<Event>> - API response with event
   */
  async getEventById(id: number): Promise<ApiResponse<Event>> {
    try {
      const event = await this.eventRepository.findById(id);
      
      if (!event) {
        return {
          success: false,
          error: ERROR_MESSAGES.EVENT_NOT_FOUND,
        };
      }

      return {
        success: true,
        data: event,
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all events with pagination and filtering
   * @param params - Query parameters
   * @returns Promise<ApiResponse<PaginatedResponse<Event>>> - API response with paginated events
   */
  async getEvents(params: EventQueryParams): Promise<ApiResponse<PaginatedResponse<Event>>> {
    try {
      const events = await this.eventRepository.findAll(params);

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update an existing event
   * @param id - Event ID
   * @param eventData - Event data to update
   * @returns Promise<ApiResponse<Event>> - API response with updated event
   */
  async updateEvent(id: number, eventData: UpdateEventRequest): Promise<ApiResponse<Event>> {
    try {
      // Validate input data
      const validation = validateEvent(eventData);
      if (!validation.isValid) {
        return {
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          message: validation.errors.map(err => `${err.field}: ${err.message}`).join(', '),
        };
      }

      // Check if event exists
      const existingEvent = await this.eventRepository.findById(id);
      if (!existingEvent) {
        return {
          success: false,
          error: ERROR_MESSAGES.EVENT_NOT_FOUND,
        };
      }

      // Check if new name/type combination already exists (if name or type is being updated)
      if (eventData.name || eventData.type) {
        const newName = eventData.name || existingEvent.name;
        const newType = eventData.type || existingEvent.type;
        
        if (newName !== existingEvent.name || newType !== existingEvent.type) {
          const conflictingEvent = await this.eventRepository.findByNameAndType(newName, newType);
          if (conflictingEvent && conflictingEvent.id !== id) {
            return {
              success: false,
              error: ERROR_MESSAGES.EVENT_ALREADY_EXISTS,
            };
          }
        }
      }

      // Update event
      const updatedEvent = await this.eventRepository.update(id, eventData);
      
      if (!updatedEvent) {
        return {
          success: false,
          error: ERROR_MESSAGES.EVENT_NOT_FOUND,
        };
      }

      return {
        success: true,
        data: updatedEvent,
        message: 'Event updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Delete an event
   * @param id - Event ID
   * @returns Promise<ApiResponse<null>> - API response
   */
  async deleteEvent(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if event exists
      const existingEvent = await this.eventRepository.findById(id);
      if (!existingEvent) {
        return {
          success: false,
          error: ERROR_MESSAGES.EVENT_NOT_FOUND,
        };
      }

      // Delete event
      const deleted = await this.eventRepository.delete(id);
      
      if (!deleted) {
        return {
          success: false,
          error: ERROR_MESSAGES.EVENT_NOT_FOUND,
        };
      }

      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if event exists by name and type
   * @param name - Event name
   * @param type - Event type
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  async eventExists(name: string, type: string): Promise<boolean> {
    return await this.eventRepository.existsByNameAndType(name, type);
  }
} 