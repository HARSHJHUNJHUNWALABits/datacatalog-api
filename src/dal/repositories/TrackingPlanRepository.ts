/**
 * TrackingPlan repository implementation using Knex
 * Follows SOLID principles - Single Responsibility Principle
 */
import { Knex } from 'knex';
import { ITrackingPlanRepository } from '../interfaces/ITrackingPlanRepository';
import { TrackingPlan, CreateTrackingPlanRequest, UpdateTrackingPlanRequest, TrackingPlanQueryParams, PaginatedResponse, DatabaseTrackingPlan } from '../../types';

export class TrackingPlanRepository implements ITrackingPlanRepository {
  constructor(private readonly db: Knex) {}

  /**
   * Create a new tracking plan
   * @param trackingPlanData - Tracking plan data to create
   * @returns Promise<TrackingPlan> - Created tracking plan
   */
  async create(trackingPlanData: CreateTrackingPlanRequest): Promise<TrackingPlan> {
    const [trackingPlan] = await this.db('tracking_plans')
      .insert({
        name: trackingPlanData.name,
        description: trackingPlanData.description,
        events: trackingPlanData.events,
      })
      .returning('*');

    return this.mapDatabaseTrackingPlanToTrackingPlan(trackingPlan);
  }

  /**
   * Find tracking plan by ID
   * @param id - Tracking plan ID
   * @returns Promise<TrackingPlan | null> - Found tracking plan or null
   */
  async findById(id: number): Promise<TrackingPlan | null> {
    const trackingPlan = await this.db('tracking_plans')
      .where({ id })
      .first();

    return trackingPlan ? this.mapDatabaseTrackingPlanToTrackingPlan(trackingPlan) : null;
  }

  /**
   * Find tracking plan by name
   * @param name - Tracking plan name
   * @returns Promise<TrackingPlan | null> - Found tracking plan or null
   */
  async findByName(name: string): Promise<TrackingPlan | null> {
    const trackingPlan = await this.db('tracking_plans')
      .where({ name })
      .first();

    return trackingPlan ? this.mapDatabaseTrackingPlanToTrackingPlan(trackingPlan) : null;
  }

  /**
   * Get all tracking plans with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<TrackingPlan>> - Paginated tracking plans
   */
  async findAll(params: TrackingPlanQueryParams): Promise<PaginatedResponse<TrackingPlan>> {
    const { page = 1, limit = 10, search } = params;
    const offset = (page - 1) * limit;

    let query = this.db('tracking_plans');

    // Apply filters
    if (search) {
      query = query.where(function(this: any) {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`);
      });
    }

    // Get total count and paginated results in parallel
    const [countResult, trackingPlans] = await Promise.all([
      query.clone().count('* as count'),
      query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
    ]);

    const total = Number(countResult[0].count);

    return {
      success: true,
      data: trackingPlans.map((trackingPlan: any) => this.mapDatabaseTrackingPlanToTrackingPlan(trackingPlan)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update an existing tracking plan
   * @param id - Tracking plan ID
   * @param trackingPlanData - Tracking plan data to update
   * @returns Promise<TrackingPlan | null> - Updated tracking plan or null if not found
   */
  async update(id: number, trackingPlanData: UpdateTrackingPlanRequest): Promise<TrackingPlan | null> {
    const updateData: Partial<DatabaseTrackingPlan> = {};
    
    if (trackingPlanData.name !== undefined) updateData.name = trackingPlanData.name;
    if (trackingPlanData.description !== undefined) updateData.description = trackingPlanData.description;
    if (trackingPlanData.events !== undefined) updateData.events = trackingPlanData.events;

    const [trackingPlan] = await this.db('tracking_plans')
      .where({ id })
      .update(updateData)
      .returning('*');

    return trackingPlan ? this.mapDatabaseTrackingPlanToTrackingPlan(trackingPlan) : null;
  }

  /**
   * Delete a tracking plan by ID
   * @param id - Tracking plan ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const deletedRows = await this.db('tracking_plans')
      .where({ id })
      .del();

    return deletedRows > 0;
  }

  /**
   * Check if tracking plan exists by name
   * @param name - Tracking plan name
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  async existsByName(name: string): Promise<boolean> {
    const trackingPlan = await this.db('tracking_plans')
      .where({ name })
      .first();

    return !!trackingPlan;
  }

  /**
   * Map database tracking plan to domain tracking plan
   * @param dbTrackingPlan - Database tracking plan object
   * @returns TrackingPlan - Domain tracking plan object
   */
  private mapDatabaseTrackingPlanToTrackingPlan(dbTrackingPlan: DatabaseTrackingPlan): TrackingPlan {
    return {
      id: dbTrackingPlan.id,
      name: dbTrackingPlan.name,
      description: dbTrackingPlan.description,
      events: dbTrackingPlan.events,
      created_at: dbTrackingPlan.created_at,
      updated_at: dbTrackingPlan.updated_at,
    };
  }
} 