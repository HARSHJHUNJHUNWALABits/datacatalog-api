/**
 * Interface for Property repository operations
 * Follows SOLID principles - Interface Segregation Principle
 */
import { Property, CreatePropertyRequest, UpdatePropertyRequest, PropertyQueryParams, PaginatedResponse } from '../../types';

export interface IPropertyRepository {
  /**
   * Create a new property
   * @param propertyData - Property data to create
   * @returns Promise<Property> - Created property
   */
  create(propertyData: CreatePropertyRequest): Promise<Property>;

  /**
   * Find property by ID
   * @param id - Property ID
   * @returns Promise<Property | null> - Found property or null
   */
  findById(id: number): Promise<Property | null>;

  /**
   * Find property by name and type
   * @param name - Property name
   * @param type - Property type
   * @returns Promise<Property | null> - Found property or null
   */
  findByNameAndType(name: string, type: string): Promise<Property | null>;

  /**
   * Get all properties with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<Property>> - Paginated properties
   */
  findAll(params: PropertyQueryParams): Promise<PaginatedResponse<Property>>;

  /**
   * Update an existing property
   * @param id - Property ID
   * @param propertyData - Property data to update
   * @returns Promise<Property | null> - Updated property or null if not found
   */
  update(id: number, propertyData: UpdatePropertyRequest): Promise<Property | null>;

  /**
   * Delete a property by ID
   * @param id - Property ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  delete(id: number): Promise<boolean>;

  /**
   * Check if property exists by name and type
   * @param name - Property name
   * @param type - Property type
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  existsByNameAndType(name: string, type: string): Promise<boolean>;

  /**
   * Find properties by names and types
   * @param properties - Array of property names and types
   * @returns Promise<Property[]> - Found properties
   */
  findByNamesAndTypes(properties: Array<{ name: string; type: string }>): Promise<Property[]>;
} 