/**
 * Event routes configuration
 */
import { Router, Request, Response } from 'express';
import { EventController } from '../controllers/EventController';
import { API_ENDPOINTS } from '../constants';

export function createEventRoutes(eventController: EventController): Router {
  const router = Router();

  // GET /api/v1/events - Get all events with pagination and filtering
  router.get(API_ENDPOINTS.EVENTS, (req: Request, res: Response) => eventController.getEvents(req, res));

  // POST /api/v1/events - Create a new event
  router.post(API_ENDPOINTS.EVENTS, (req: Request, res: Response) => eventController.createEvent(req, res));

  // GET /api/v1/events/:id - Get event by ID
  router.get(`${API_ENDPOINTS.EVENTS}/:id`, (req: Request, res: Response) => eventController.getEventById(req, res));

  // PUT /api/v1/events/:id - Update an existing event
  router.put(`${API_ENDPOINTS.EVENTS}/:id`, (req: Request, res: Response) => eventController.updateEvent(req, res));

  // DELETE /api/v1/events/:id - Delete an event
  router.delete(`${API_ENDPOINTS.EVENTS}/:id`, (req: Request, res: Response) => eventController.deleteEvent(req, res));

  return router;
} 