/**
 * Property repository implementation using Knex
 * Follows SOLID principles - Single Responsibility Principle
 */
import { Knex } from 'knex';
import { IPropertyRepository } from '../interfaces/IPropertyRepository';
import { Property, CreatePropertyRequest, UpdatePropertyRequest, PropertyQueryParams, PaginatedResponse, DatabaseProperty } from '../../types';

export class PropertyRepository implements IPropertyRepository {
  constructor(private readonly db: Knex) {}

  /**
   * Create a new property
   * @param propertyData - Property data to create
   * @returns Promise<Property> - Created property
   */
  async create(propertyData: CreatePropertyRequest): Promise<Property> {
    const [property] = await this.db('properties')
      .insert({
        name: propertyData.name,
        type: propertyData.type,
        description: propertyData.description,
        validation_rules: propertyData.validation_rules || null,
      })
      .returning('*');

    return this.mapDatabasePropertyToProperty(property);
  }

  /**
   * Find property by ID
   * @param id - Property ID
   * @returns Promise<Property | null> - Found property or null
   */
  async findById(id: number): Promise<Property | null> {
    const property = await this.db('properties')
      .where({ id })
      .first();

    return property ? this.mapDatabasePropertyToProperty(property) : null;
  }

  /**
   * Find property by name and type
   * @param name - Property name
   * @param type - Property type
   * @returns Promise<Property | null> - Found property or null
   */
  async findByNameAndType(name: string, type: string): Promise<Property | null> {
    const property = await this.db('properties')
      .where({ name, type })
      .first();

    return property ? this.mapDatabasePropertyToProperty(property) : null;
  }

  /**
   * Get all properties with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<Property>> - Paginated properties
   */
  async findAll(params: PropertyQueryParams): Promise<PaginatedResponse<Property>> {
    const { page = 1, limit = 10, type, search } = params;
    const offset = (page - 1) * limit;

    let query = this.db('properties');

    // Apply filters
    if (type) {
      query = query.where({ type });
    }

    if (search) {
      query = query.where(function(this: any) {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`);
      });
    }

    // Get total count and paginated results in parallel
    const [countResult, properties] = await Promise.all([
      query.clone().count('* as count'),
      query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
    ]);

    const total = Number(countResult[0].count);

    return {
      success: true,
      data: properties.map((property: any) => this.mapDatabasePropertyToProperty(property)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update an existing property
   * @param id - Property ID
   * @param propertyData - Property data to update
   * @returns Promise<Property | null> - Updated property or null if not found
   */
  async update(id: number, propertyData: UpdatePropertyRequest): Promise<Property | null> {
    const updateData: Partial<DatabaseProperty> = {};
    
    if (propertyData.name !== undefined) updateData.name = propertyData.name;
    if (propertyData.type !== undefined) updateData.type = propertyData.type;
    if (propertyData.description !== undefined) updateData.description = propertyData.description;
    if (propertyData.validation_rules !== undefined) {
      updateData.validation_rules = propertyData.validation_rules || null;
    }

    const [property] = await this.db('properties')
      .where({ id })
      .update(updateData)
      .returning('*');

    return property ? this.mapDatabasePropertyToProperty(property) : null;
  }

  /**
   * Delete a property by ID
   * @param id - Property ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const deletedRows = await this.db('properties')
      .where({ id })
      .del();

    return deletedRows > 0;
  }

  /**
   * Check if property exists by name and type
   * @param name - Property name
   * @param type - Property type
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  async existsByNameAndType(name: string, type: string): Promise<boolean> {
    const property = await this.db('properties')
      .where({ name, type })
      .first();

    return !!property;
  }

  /**
   * Find properties by names and types
   * @param properties - Array of property names and types
   * @returns Promise<Property[]> - Found properties
   */
  async findByNamesAndTypes(properties: Array<{ name: string; type: string }>): Promise<Property[]> {
    const query = this.db('properties');
    
    properties.forEach((prop, index) => {
      if (index === 0) {
        query.where({ name: prop.name, type: prop.type });
      } else {
        query.orWhere({ name: prop.name, type: prop.type });
      }
    });

    const dbProperties = await query;
    return dbProperties.map((property: any) => this.mapDatabasePropertyToProperty(property));
  }

  /**
   * Map database property to domain property
   * @param dbProperty - Database property object
   * @returns Property - Domain property object
   */
  private mapDatabasePropertyToProperty(dbProperty: DatabaseProperty): Property {
    return {
      id: dbProperty.id,
      name: dbProperty.name,
      type: dbProperty.type,
      description: dbProperty.description,
      validation_rules: dbProperty.validation_rules ? JSON.stringify(dbProperty.validation_rules) : undefined,
      created_at: dbProperty.created_at,
      updated_at: dbProperty.updated_at,
    };
  }
} 