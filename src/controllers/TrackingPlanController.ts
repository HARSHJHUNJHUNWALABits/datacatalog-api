/**
 * TrackingPlan controller for handling HTTP requests
 * Follows SOLID principles - Single Responsibility Principle
 */
import { Request, Response } from 'express';
import { TrackingPlanService } from '../services/TrackingPlanService';
import { CreateTrackingPlanRequest, UpdateTrackingPlanRequest, TrackingPlanQueryParams } from '../types';
import { HTTP_STATUS_CODES } from '../constants';

export class TrackingPlanController {
  constructor(private readonly trackingPlanService: TrackingPlanService) {}

  /**
   * Create a new tracking plan
   * @param req - Express request object
   * @param res - Express response object
   */
  async createTrackingPlan(req: Request, res: Response): Promise<void> {
    try {
      const trackingPlanData: CreateTrackingPlanRequest = req.body;
      const result = await this.trackingPlanService.createTrackingPlan(trackingPlanData);

      if (result.success) {
        res.status(HTTP_STATUS_CODES.CREATED).json(result);
      } else {
        res.status(HTTP_STATUS_CODES.CONFLICT).json(result);
      }
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get tracking plan by ID
   * @param req - Express request object
   * @param res - Express response object
   */
  async getTrackingPlanById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid tracking plan ID',
        });
        return;
      }

      const result = await this.trackingPlanService.getTrackingPlanById(id);

      if (result.success) {
        res.status(HTTP_STATUS_CODES.OK).json(result);
      } else {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json(result);
      }
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get all tracking plans with pagination and filtering
   * @param req - Express request object
   * @param res - Express response object
   */
  async getTrackingPlans(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: TrackingPlanQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string,
      };

      const result = await this.trackingPlanService.getTrackingPlans(queryParams);

      if (result.success) {
        res.status(HTTP_STATUS_CODES.OK).json(result);
      } else {
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(result);
      }
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Update an existing tracking plan
   * @param req - Express request object
   * @param res - Express response object
   */
  async updateTrackingPlan(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid tracking plan ID',
        });
        return;
      }

      const trackingPlanData: UpdateTrackingPlanRequest = req.body;
      const result = await this.trackingPlanService.updateTrackingPlan(id, trackingPlanData);

      if (result.success) {
        res.status(HTTP_STATUS_CODES.OK).json(result);
      } else if (result.error === 'Tracking plan not found') {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json(result);
      } else {
        res.status(HTTP_STATUS_CODES.CONFLICT).json(result);
      }
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Delete a tracking plan
   * @param req - Express request object
   * @param res - Express response object
   */
  async deleteTrackingPlan(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid tracking plan ID',
        });
        return;
      }

      const result = await this.trackingPlanService.deleteTrackingPlan(id);

      if (result.success) {
        res.status(HTTP_STATUS_CODES.OK).json(result);
      } else {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json(result);
      }
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
} 