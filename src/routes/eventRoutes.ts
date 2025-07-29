/**
 * Event routes configuration
 *
 * @openapi
 * /api/v1/events:
 *   get:
 *     summary: Get all events with pagination and filtering
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [track, identify, alias, screen, page]
 *         description: Filter by event type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by event name
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEventResponse'
 *   post:
 *     summary: Create a new event
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 *       409:
 *         description: Event already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 *   put:
 *     summary: Update an existing event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventRequest'
 *     responses:
 *       200:
 *         description: Event updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 *   delete:
 *     summary: Delete an event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 */
import { Router, Request, Response } from 'express';
import { EventController } from '../controllers/EventController';
import { API_ENDPOINTS } from '../constants';

export function createEventRoutes(eventController: EventController): Router {
  const router = Router();

  // GET /api/v1/events - Get all events with pagination and filtering
  router.get(`/${API_ENDPOINTS.EVENTS}`, (req: Request, res: Response) => eventController.getEvents(req, res));

  // POST /api/v1/events - Create a new event
  router.post(`/${API_ENDPOINTS.EVENTS}`, (req: Request, res: Response) => eventController.createEvent(req, res));

  // GET /api/v1/events/:id - Get event by ID
  router.get(`/${API_ENDPOINTS.EVENTS}/:id`, (req: Request, res: Response) => eventController.getEventById(req, res));

  // PUT /api/v1/events/:id - Update an existing event
  router.put(`/${API_ENDPOINTS.EVENTS}/:id`, (req: Request, res: Response) => eventController.updateEvent(req, res));

  // DELETE /api/v1/events/:id - Delete an event
  router.delete(`/${API_ENDPOINTS.EVENTS}/:id`, (req: Request, res: Response) => eventController.deleteEvent(req, res));

  return router;
} 