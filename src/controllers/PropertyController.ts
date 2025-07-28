/**
 * Property controller for handling HTTP requests
 * Follows SOLID principles - Single Responsibility Principle
 */
import { Request, Response } from 'express';
import { PropertyService } from '../services/PropertyService';
import { CreatePropertyRequest, UpdatePropertyRequest, PropertyQueryParams } from '../types';
import { HTTP_STATUS_CODES } from '../constants';

export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  /**
   * Create a new property
   * @param req - Express request object
   * @param res - Express response object
   */
  async createProperty(req: Request, res: Response): Promise<void> {
    try {
      const propertyData: CreatePropertyRequest = req.body;
      const result = await this.propertyService.createProperty(propertyData);

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
   * Get property by ID
   * @param req - Express request object
   * @param res - Express response object
   */
  async getPropertyById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid property ID',
        });
        return;
      }

      const result = await this.propertyService.getPropertyById(id);

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
   * Get all properties with pagination and filtering
   * @param req - Express request object
   * @param res - Express response object
   */
  async getProperties(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: PropertyQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        type: req.query.type as any,
        search: req.query.search as string,
      };

      const result = await this.propertyService.getProperties(queryParams);

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
   * Update an existing property
   * @param req - Express request object
   * @param res - Express response object
   */
  async updateProperty(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid property ID',
        });
        return;
      }

      const propertyData: UpdatePropertyRequest = req.body;
      const result = await this.propertyService.updateProperty(id, propertyData);

      if (result.success) {
        res.status(HTTP_STATUS_CODES.OK).json(result);
      } else if (result.error === 'Property not found') {
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
   * Delete a property
   * @param req - Express request object
   * @param res - Express response object
   */
  async deleteProperty(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid property ID',
        });
        return;
      }

      const result = await this.propertyService.deleteProperty(id);

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