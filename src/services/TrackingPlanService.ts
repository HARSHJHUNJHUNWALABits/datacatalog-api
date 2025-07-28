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
import { validateTrackingPlan } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants';

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
      // Validate input data
      const validation = validateTrackingPlan(trackingPlanData);
      if (!validation.isValid) {
        return {
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          message: validation.errors.map(err => `${err.field}: ${err.message}`).join(', '),
        };
      }

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
        return processedEvents;
      }

      // Create tracking plan with processed events
      const trackingPlan = await this.trackingPlanRepository.create({
        ...trackingPlanData,
        events: processedEvents.data!,
      });

      return {
        success: true,
        data: trackingPlan,
        message: 'Tracking plan created successfully',
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
   * Get tracking plan by ID
   * @param id - Tracking plan ID
   * @returns Promise<ApiResponse<TrackingPlan>> - API response with tracking plan
   */
  async getTrackingPlanById(id: number): Promise<ApiResponse<TrackingPlan>> {
    try {
      const trackingPlan = await this.trackingPlanRepository.findById(id);
      
      if (!trackingPlan) {
        return {
          success: false,
          error: ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND,
        };
      }

      return {
        success: true,
        data: trackingPlan,
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
   * Get all tracking plans with pagination and filtering
   * @param params - Query parameters
   * @returns Promise<ApiResponse<PaginatedResponse<TrackingPlan>>> - API response with paginated tracking plans
   */
  async getTrackingPlans(params: TrackingPlanQueryParams): Promise<ApiResponse<PaginatedResponse<TrackingPlan>>> {
    try {
      const trackingPlans = await this.trackingPlanRepository.findAll(params);

      return {
        success: true,
        data: trackingPlans,
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
        const validation = validateTrackingPlan({ ...existingTrackingPlan, events: trackingPlanData.events });
        if (!validation.isValid) {
          return {
            success: false,
            error: ERROR_MESSAGES.VALIDATION_ERROR,
            message: validation.errors.map(err => `${err.field}: ${err.message}`).join(', '),
          };
        }

        const processedEvents = await this.processTrackingPlanEvents(trackingPlanData.events);
        if (!processedEvents.success) {
          return processedEvents;
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
      const updatedTrackingPlan = await this.trackingPlanRepository.update(id, trackingPlanData);
      
      if (!updatedTrackingPlan) {
        return {
          success: false,
          error: ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND,
        };
      }

      return {
        success: true,
        data: updatedTrackingPlan,
        message: 'Tracking plan updated successfully',
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
      const deleted = await this.trackingPlanRepository.delete(id);
      
      if (!deleted) {
        return {
          success: false,
          error: ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND,
        };
      }

      return {
        success: true,
        message: 'Tracking plan deleted successfully',
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
   * Process tracking plan events - create events and properties if they don't exist
   * @param events - Array of tracking plan events
   * @returns Promise<ApiResponse<TrackingPlanEvent[]>> - Processed events or error
   */
  private async processTrackingPlanEvents(events: TrackingPlanEvent[]): Promise<ApiResponse<TrackingPlanEvent[]>> {
    try {
      const processedEvents: TrackingPlanEvent[] = [];

      for (const event of events) {
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
            return {
              success: false,
              error: ERROR_MESSAGES.EVENT_ALREADY_EXISTS,
              message: `Event '${event.name}' already exists with a different description`,
            };
          }
        }

        // Process properties for this event
        const processedProperties: TrackingPlanProperty[] = [];
        
        for (const property of event.properties) {
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
              return {
                success: false,
                error: ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS,
                message: `Property '${property.name}' already exists with a different description`,
              };
            }
          }

          processedProperties.push(property);
        }

        processedEvents.push({
          ...event,
          properties: processedProperties,
        });
      }

      return {
        success: true,
        data: processedEvents,
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
} 