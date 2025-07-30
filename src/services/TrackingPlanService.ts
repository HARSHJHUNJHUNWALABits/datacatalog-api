/**
 * TrackingPlan service for business logic operations
 * Follows SOLID principles - Single Responsibility Principle
 */
import { ITrackingPlanRepository } from '../dal/interfaces/ITrackingPlanRepository';
import { IEventRepository } from '../dal/interfaces/IEventRepository';
import { IPropertyRepository } from '../dal/interfaces/IPropertyRepository';
import { 
  TrackingPlan, 
  CreateTrackingPlanRequest, 
  UpdateTrackingPlanRequest, 
  TrackingPlanQueryParams, 
  PaginatedResponse, 
  ApiResponse,
  TrackingPlanEvent,
  TrackingPlanProperty,
  CreateEventRequest,
  CreatePropertyRequest
} from '../types';
import { ERROR_MESSAGES } from '../constants';
import { 
  handleAsyncOperationWithMessage, 
  handleAsyncOperationWithNullCheck, 
  handleAsyncOperation, 
  handleBooleanOperation,
  handleAsyncOperationWithNullCheckAndMessage,
  createErrorResponse
} from '../utils/errorHandler';

export class TrackingPlanService {
  constructor(
    private readonly trackingPlanRepository: ITrackingPlanRepository,
    private readonly eventRepository: IEventRepository,
    private readonly propertyRepository: IPropertyRepository
  ) {}

  /**
   * Create a new tracking plan with automatic creation of events and properties
   * @param trackingPlanData - Tracking plan data to create
   * @returns Promise<ApiResponse<TrackingPlan>> - API response with created tracking plan
   */
  async createTrackingPlan(trackingPlanData: CreateTrackingPlanRequest): Promise<ApiResponse<TrackingPlan>> {
    try {
      // Check if tracking plan already exists
      const existingTrackingPlan = await this.trackingPlanRepository.findByName(trackingPlanData.name);
      if (existingTrackingPlan) {
        return {
          success: false,
          error: ERROR_MESSAGES.TRACKING_PLAN_ALREADY_EXISTS,
        };
      }

      // Process events and properties - create them if they don't exist
      const processedEvents = await this.processTrackingPlanEvents(trackingPlanData.events);
      if (!processedEvents.success) {
        return {
          success: false,
          error: processedEvents.error || ERROR_MESSAGES.INTERNAL_ERROR,
          message: processedEvents.message,
        };
      }

      // Create tracking plan with processed events
      return await handleAsyncOperationWithMessage(
        () => this.trackingPlanRepository.create({
          ...trackingPlanData,
          events: processedEvents.data!,
        }),
        'Tracking plan created successfully'
      );
    } catch (error) {
      return createErrorResponse<TrackingPlan>(error);
    }
  }

  /**
   * Get tracking plan by ID
   * @param id - Tracking plan ID
   * @returns Promise<ApiResponse<TrackingPlan>> - API response with tracking plan
   */
  async getTrackingPlanById(id: number): Promise<ApiResponse<TrackingPlan>> {
    return await handleAsyncOperationWithNullCheck(
      () => this.trackingPlanRepository.findById(id),
      ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND
    );
  }

  /**
   * Get all tracking plans with pagination and filtering
   * @param params - Query parameters
   * @returns Promise<ApiResponse<PaginatedResponse<TrackingPlan>>> - API response with paginated tracking plans
   */
  async getTrackingPlans(params: TrackingPlanQueryParams): Promise<ApiResponse<PaginatedResponse<TrackingPlan>>> {
    return await handleAsyncOperation(
      () => this.trackingPlanRepository.findAll(params)
    );
  }

  /**
   * Update an existing tracking plan
   * @param id - Tracking plan ID
   * @param trackingPlanData - Tracking plan data to update
   * @returns Promise<ApiResponse<TrackingPlan>> - API response with updated tracking plan
   */
  async updateTrackingPlan(id: number, trackingPlanData: UpdateTrackingPlanRequest): Promise<ApiResponse<TrackingPlan>> {
    try {
      // Check if tracking plan exists
      const existingTrackingPlan = await this.trackingPlanRepository.findById(id);
      if (!existingTrackingPlan) {
        return {
          success: false,
          error: ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND,
        };
      }

      // If events are being updated, process them
      if (trackingPlanData.events) {
        const processedEvents = await this.processTrackingPlanEvents(trackingPlanData.events);
        if (!processedEvents.success) {
          return {
            success: false,
            error: processedEvents.error || ERROR_MESSAGES.INTERNAL_ERROR,
            message: processedEvents.message,
          };
        }

        trackingPlanData.events = processedEvents.data!;
      }

      // Check if new name already exists (if name is being updated)
      if (trackingPlanData.name && trackingPlanData.name !== existingTrackingPlan.name) {
        const conflictingTrackingPlan = await this.trackingPlanRepository.findByName(trackingPlanData.name);
        if (conflictingTrackingPlan) {
          return {
            success: false,
            error: ERROR_MESSAGES.TRACKING_PLAN_ALREADY_EXISTS,
          };
        }
      }

      // Update tracking plan
      return await handleAsyncOperationWithNullCheckAndMessage(
        () => this.trackingPlanRepository.update(id, trackingPlanData),
        ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND,
        'Tracking plan updated successfully'
      );
    } catch (error) {
      return createErrorResponse<TrackingPlan>(error);
    }
  }

  /**
   * Delete a tracking plan
   * @param id - Tracking plan ID
   * @returns Promise<ApiResponse<null>> - API response
   */
  async deleteTrackingPlan(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if tracking plan exists
      const existingTrackingPlan = await this.trackingPlanRepository.findById(id);
      if (!existingTrackingPlan) {
        return {
          success: false,
          error: ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND,
        };
      }

      // Delete tracking plan
      return await handleBooleanOperation(
        () => this.trackingPlanRepository.delete(id),
        ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND,
        'Tracking plan deleted successfully'
      );
    } catch (error) {
      return createErrorResponse<null>(error);
    }
  }

  /**
   * Process tracking plan events - create events and properties if they don't exist
   * @param events - Array of tracking plan events
   * @returns Promise<ApiResponse<TrackingPlanEvent[]>> - Processed events or error
   */
  private async processTrackingPlanEvents(events: TrackingPlanEvent[]): Promise<ApiResponse<TrackingPlanEvent[]>> {
    try {
      // Process all events in parallel
      const eventPromises = events.map(async (event) => {
        // Check if event exists, if not create it
        let existingEvent = await this.eventRepository.findByNameAndType(event.name, 'track'); // Default to 'track' type
        
        if (!existingEvent) {
          const createEventRequest: CreateEventRequest = {
            name: event.name,
            type: 'track', // Default type for tracking plan events
            description: event.description,
          };

          const eventResult = await this.eventRepository.create(createEventRequest);
          existingEvent = eventResult;
        } else {
          // Check if description matches
          if (existingEvent.description !== event.description) {
            throw new Error(`EVENT_CONFLICT:${event.name}`);
          }
        }

        // Process all properties for this event in parallel
        const propertyPromises = event.properties.map(async (property) => {
          // Check if property exists, if not create it
          let existingProperty = await this.propertyRepository.findByNameAndType(property.name, property.type);
          
          if (!existingProperty) {
            const createPropertyRequest: CreatePropertyRequest = {
              name: property.name,
              type: property.type,
              description: property.description,
            };

            const propertyResult = await this.propertyRepository.create(createPropertyRequest);
            existingProperty = propertyResult;
          } else {
            // Check if description matches
            if (existingProperty.description !== property.description) {
              throw new Error(`PROPERTY_CONFLICT:${property.name}`);
            }
          }

          return property;
        });

        // Wait for all properties to be processed
        const processedProperties = await Promise.all(propertyPromises);

        return {
          ...event,
          properties: processedProperties,
        };
      });

      // Wait for all events to be processed
      const processedEvents = await Promise.all(eventPromises);

      return {
        success: true,
        data: processedEvents,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Handle specific conflict errors
      if (errorMessage.startsWith('EVENT_CONFLICT:')) {
        const eventName = errorMessage.split(':')[1];
        return {
          success: false,
          error: ERROR_MESSAGES.EVENT_ALREADY_EXISTS,
          message: `Event '${eventName}' already exists with a different description`,
        };
      }
      
      if (errorMessage.startsWith('PROPERTY_CONFLICT:')) {
        const propertyName = errorMessage.split(':')[1];
        return {
          success: false,
          error: ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS,
          message: `Property '${propertyName}' already exists with a different description`,
        };
      }

      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: errorMessage,
      };
    }
  }
}