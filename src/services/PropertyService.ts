/**
 * Property service for business logic operations
 * Follows SOLID principles - Single Responsibility Principle
 */
import { IPropertyRepository } from '../dal/interfaces/IPropertyRepository';
import { Property, CreatePropertyRequest, UpdatePropertyRequest, PropertyQueryParams, PaginatedResponse, ApiResponse } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { 
  handleAsyncOperationWithMessage, 
  handleAsyncOperationWithNullCheck, 
  handleAsyncOperation, 
  handleBooleanOperation,
  handleAsyncOperationWithNullCheckAndMessage,
  createErrorResponse
} from '../utils/errorHandler';

export class PropertyService {
  constructor(private readonly propertyRepository: IPropertyRepository) {}

  /**
   * Create a new property
   * @param propertyData - Property data to create
   * @returns Promise<ApiResponse<Property>> - API response with created property
   */
  async createProperty(propertyData: CreatePropertyRequest): Promise<ApiResponse<Property>> {
    try {
      // Check if property already exists
      const existingProperty = await this.propertyRepository.findByNameAndType(propertyData.name, propertyData.type);
      if (existingProperty) {
        return {
          success: false,
          error: ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS,
        };
      }

      // Create property
      return await handleAsyncOperationWithMessage(
        () => this.propertyRepository.create(propertyData),
        'Property created successfully'
      );
    } catch (error) {
      return createErrorResponse<Property>(error);
    }
  }

  /**
   * Get property by ID
   * @param id - Property ID
   * @returns Promise<ApiResponse<Property>> - API response with property
   */
  async getPropertyById(id: number): Promise<ApiResponse<Property>> {
    return await handleAsyncOperationWithNullCheck(
      () => this.propertyRepository.findById(id),
      ERROR_MESSAGES.PROPERTY_NOT_FOUND
    );
  }

  /**
   * Get all properties with pagination and filtering
   * @param params - Query parameters
   * @returns Promise<ApiResponse<PaginatedResponse<Property>>> - API response with paginated properties
   */
  async getProperties(params: PropertyQueryParams): Promise<ApiResponse<PaginatedResponse<Property>>> {
    return await handleAsyncOperation(
      () => this.propertyRepository.findAll(params)
    );
  }

  /**
   * Update an existing property
   * @param id - Property ID
   * @param propertyData - Property data to update
   * @returns Promise<ApiResponse<Property>> - API response with updated property
   */
  async updateProperty(id: number, propertyData: UpdatePropertyRequest): Promise<ApiResponse<Property>> {
    try {
      // Check if property exists and if there are conflicts in parallel
      const [existingProperty, conflictingProperty] = await Promise.all([
        this.propertyRepository.findById(id),
        (propertyData.name || propertyData.type) ? 
          this.propertyRepository.findByNameAndType(
            propertyData.name || '', 
            propertyData.type || ''
          ) : 
          Promise.resolve(null)
      ]);

      if (!existingProperty) {
        return {
          success: false,
          error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        };
      }

      // Check if new name/type combination already exists (if name or type is being updated)
      if (propertyData.name || propertyData.type) {
        const newName = propertyData.name || existingProperty.name;
        const newType = propertyData.type || existingProperty.type;
        
        if (newName !== existingProperty.name || newType !== existingProperty.type) {
          if (conflictingProperty && conflictingProperty.id !== id) {
            return {
              success: false,
              error: ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS,
            };
          }
        }
      }

      // Update property
      return await handleAsyncOperationWithNullCheckAndMessage(
        () => this.propertyRepository.update(id, propertyData),
        ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        'Property updated successfully'
      );
    } catch (error) {
      return createErrorResponse<Property>(error);
    }
  }

  /**
   * Delete a property
   * @param id - Property ID
   * @returns Promise<ApiResponse<null>> - API response
   */
  async deleteProperty(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if property exists
      const existingProperty = await this.propertyRepository.findById(id);
      if (!existingProperty) {
        return {
          success: false,
          error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        };
      }

      // Delete property
      return await handleBooleanOperation(
        () => this.propertyRepository.delete(id),
        ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        'Property deleted successfully'
      );
    } catch (error) {
      return createErrorResponse<null>(error);
    }
  }

  /**
   * Check if property exists by name and type
   * @param name - Property name
   * @param type - Property type
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  async propertyExists(name: string, type: string): Promise<boolean> {
    return await this.propertyRepository.existsByNameAndType(name, type);
  }

  /**
   * Find properties by names and types
   * @param properties - Array of property names and types
   * @returns Promise<Property[]> - Found properties
   */
  async findPropertiesByNamesAndTypes(properties: Array<{ name: string; type: string }>): Promise<Property[]> {
    return await this.propertyRepository.findByNamesAndTypes(properties);
  }
} 