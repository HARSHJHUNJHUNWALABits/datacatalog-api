/**
 * Interface for TrackingPlan repository operations
 * Follows SOLID principles - Interface Segregation Principle
 */
import { TrackingPlan, CreateTrackingPlanRequest, UpdateTrackingPlanRequest, TrackingPlanQueryParams, PaginatedResponse } from '../../types';

export interface ITrackingPlanRepository {
  /**
   * Create a new tracking plan
   * @param trackingPlanData - Tracking plan data to create
   * @returns Promise<TrackingPlan> - Created tracking plan
   */
  create(trackingPlanData: CreateTrackingPlanRequest): Promise<TrackingPlan>;

  /**
   * Find tracking plan by ID
   * @param id - Tracking plan ID
   * @returns Promise<TrackingPlan | null> - Found tracking plan or null
   */
  findById(id: number): Promise<TrackingPlan | null>;

  /**
   * Find tracking plan by name
   * @param name - Tracking plan name
   * @returns Promise<TrackingPlan | null> - Found tracking plan or null
   */
  findByName(name: string): Promise<TrackingPlan | null>;

  /**
   * Get all tracking plans with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<TrackingPlan>> - Paginated tracking plans
   */
  findAll(params: TrackingPlanQueryParams): Promise<PaginatedResponse<TrackingPlan>>;

  /**
   * Update an existing tracking plan
   * @param id - Tracking plan ID
   * @param trackingPlanData - Tracking plan data to update
   * @returns Promise<TrackingPlan | null> - Updated tracking plan or null if not found
   */
  update(id: number, trackingPlanData: UpdateTrackingPlanRequest): Promise<TrackingPlan | null>;

  /**
   * Delete a tracking plan by ID
   * @param id - Tracking plan ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  delete(id: number): Promise<boolean>;

  /**
   * Check if tracking plan exists by name
   * @param name - Tracking plan name
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  existsByName(name: string): Promise<boolean>;
} 