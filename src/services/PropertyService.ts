/**
 * Property service for business logic operations
 * Follows SOLID principles - Single Responsibility Principle
 */
import { IPropertyRepository } from '../dal/interfaces/IPropertyRepository';
import { Property, CreatePropertyRequest, UpdatePropertyRequest, PropertyQueryParams, PaginatedResponse, ApiResponse } from '../types';
import { validateProperty } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants';

export class PropertyService {
  constructor(private readonly propertyRepository: IPropertyRepository) {}

  /**
   * Create a new property
   * @param propertyData - Property data to create
   * @returns Promise<ApiResponse<Property>> - API response with created property
   */
  async createProperty(propertyData: CreatePropertyRequest): Promise<ApiResponse<Property>> {
    try {
      // Validate input data
      const validation = validateProperty(propertyData);
      if (!validation.isValid) {
        return {
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          message: validation.errors.map(err => `${err.field}: ${err.message}`).join(', '),
        };
      }

      // Check if property already exists
      const existingProperty = await this.propertyRepository.findByNameAndType(propertyData.name, propertyData.type);
      if (existingProperty) {
        return {
          success: false,
          error: ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS,
        };
      }

      // Create property
      const property = await this.propertyRepository.create(propertyData);

      return {
        success: true,
        data: property,
        message: 'Property created successfully',
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
   * Get property by ID
   * @param id - Property ID
   * @returns Promise<ApiResponse<Property>> - API response with property
   */
  async getPropertyById(id: number): Promise<ApiResponse<Property>> {
    try {
      const property = await this.propertyRepository.findById(id);
      
      if (!property) {
        return {
          success: false,
          error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        };
      }

      return {
        success: true,
        data: property,
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
   * Get all properties with pagination and filtering
   * @param params - Query parameters
   * @returns Promise<ApiResponse<PaginatedResponse<Property>>> - API response with paginated properties
   */
  async getProperties(params: PropertyQueryParams): Promise<ApiResponse<PaginatedResponse<Property>>> {
    try {
      const properties = await this.propertyRepository.findAll(params);

      return {
        success: true,
        data: properties,
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
   * Update an existing property
   * @param id - Property ID
   * @param propertyData - Property data to update
   * @returns Promise<ApiResponse<Property>> - API response with updated property
   */
  async updateProperty(id: number, propertyData: UpdatePropertyRequest): Promise<ApiResponse<Property>> {
    try {
      // Validate input data
      const validation = validateProperty(propertyData);
      if (!validation.isValid) {
        return {
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          message: validation.errors.map(err => `${err.field}: ${err.message}`).join(', '),
        };
      }

      // Check if property exists
      const existingProperty = await this.propertyRepository.findById(id);
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
          const conflictingProperty = await this.propertyRepository.findByNameAndType(newName, newType);
          if (conflictingProperty && conflictingProperty.id !== id) {
            return {
              success: false,
              error: ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS,
            };
          }
        }
      }

      // Update property
      const updatedProperty = await this.propertyRepository.update(id, propertyData);
      
      if (!updatedProperty) {
        return {
          success: false,
          error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        };
      }

      return {
        success: true,
        data: updatedProperty,
        message: 'Property updated successfully',
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
      const deleted = await this.propertyRepository.delete(id);
      
      if (!deleted) {
        return {
          success: false,
          error: ERROR_MESSAGES.PROPERTY_NOT_FOUND,
        };
      }

      return {
        success: true,
        message: 'Property deleted successfully',
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