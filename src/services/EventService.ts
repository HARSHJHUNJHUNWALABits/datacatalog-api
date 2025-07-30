/**
 * Event service for business logic operations
 * Follows SOLID principles - Single Responsibility Principle
 */
import { IEventRepository } from '../dal/interfaces/IEventRepository';
import { Event, CreateEventRequest, UpdateEventRequest, EventQueryParams, PaginatedResponse, ApiResponse } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { 
  handleAsyncOperationWithMessage, 
  handleAsyncOperationWithNullCheck, 
  handleAsyncOperation, 
  handleBooleanOperation,
  handleAsyncOperationWithNullCheckAndMessage,
  createErrorResponse
} from '../utils/errorHandler';

export class EventService {
  constructor(private readonly eventRepository: IEventRepository) {}

  /**
   * Create a new event
   * @param eventData - Event data to create
   * @returns Promise<ApiResponse<Event>> - API response with created event
   */
  async createEvent(eventData: CreateEventRequest): Promise<ApiResponse<Event>> {
    try {
      // Check if event already exists
      const existingEvent = await this.eventRepository.findByNameAndType(eventData.name, eventData.type);
      if (existingEvent) {
        return {
          success: false,
          error: ERROR_MESSAGES.EVENT_ALREADY_EXISTS,
        };
      }

      // Create event
      return await handleAsyncOperationWithMessage(
        () => this.eventRepository.create(eventData),
        'Event created successfully'
      );
    } catch (error) {
      return createErrorResponse<Event>(error);
    }
  }

  /**
   * Get event by ID
   * @param id - Event ID
   * @returns Promise<ApiResponse<Event>> - API response with event
   */
  async getEventById(id: number): Promise<ApiResponse<Event>> {
    return await handleAsyncOperationWithNullCheck(
      () => this.eventRepository.findById(id),
      ERROR_MESSAGES.EVENT_NOT_FOUND
    );
  }

  /**
   * Get all events with pagination and filtering
   * @param params - Query parameters
   * @returns Promise<ApiResponse<PaginatedResponse<Event>>> - API response with paginated events
   */
  async getEvents(params: EventQueryParams): Promise<ApiResponse<PaginatedResponse<Event>>> {
    return await handleAsyncOperation(
      () => this.eventRepository.findAll(params)
    );
  }

  /**
   * Update an existing event
   * @param id - Event ID
   * @param eventData - Event data to update
   * @returns Promise<ApiResponse<Event>> - API response with updated event
   */
  async updateEvent(id: number, eventData: UpdateEventRequest): Promise<ApiResponse<Event>> {
    try {
      // Check if event exists and if there are conflicts in parallel
      const [existingEvent, conflictingEvent] = await Promise.all([
        this.eventRepository.findById(id),
        (eventData.name || eventData.type) ? 
          this.eventRepository.findByNameAndType(
            eventData.name || '', 
            eventData.type || ''
          ) : 
          Promise.resolve(null)
      ]);

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
          if (conflictingEvent && conflictingEvent.id !== id) {
            return {
              success: false,
              error: ERROR_MESSAGES.EVENT_ALREADY_EXISTS,
            };
          }
        }
      }

      // Update event
      return await handleAsyncOperationWithNullCheckAndMessage(
        () => this.eventRepository.update(id, eventData),
        ERROR_MESSAGES.EVENT_NOT_FOUND,
        'Event updated successfully'
      );
    } catch (error) {
      return createErrorResponse<Event>(error);
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
      return await handleBooleanOperation(
        () => this.eventRepository.delete(id),
        ERROR_MESSAGES.EVENT_NOT_FOUND,
        'Event deleted successfully'
      );
    } catch (error) {
      return createErrorResponse<null>(error);
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