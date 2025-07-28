/**
 * Event controller for handling HTTP requests
 * Follows SOLID principles - Single Responsibility Principle
 */
import { Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { CreateEventRequest, UpdateEventRequest, EventQueryParams } from '../types';
import { HTTP_STATUS_CODES } from '../constants';

export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * Create a new event
   * @param req - Express request object
   * @param res - Express response object
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData: CreateEventRequest = req.body;
      const result = await this.eventService.createEvent(eventData);

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
   * Get event by ID
   * @param req - Express request object
   * @param res - Express response object
   */
  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid event ID',
        });
        return;
      }

      const result = await this.eventService.getEventById(id);

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
   * Get all events with pagination and filtering
   * @param req - Express request object
   * @param res - Express response object
   */
  async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: EventQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        type: req.query.type as any,
        search: req.query.search as string,
      };

      const result = await this.eventService.getEvents(queryParams);

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
   * Update an existing event
   * @param req - Express request object
   * @param res - Express response object
   */
  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid event ID',
        });
        return;
      }

      const eventData: UpdateEventRequest = req.body;
      const result = await this.eventService.updateEvent(id, eventData);

      if (result.success) {
        res.status(HTTP_STATUS_CODES.OK).json(result);
      } else if (result.error === 'Event not found') {
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
   * Delete an event
   * @param req - Express request object
   * @param res - Express response object
   */
  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          success: false,
          error: 'Invalid event ID',
        });
        return;
      }

      const result = await this.eventService.deleteEvent(id);

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