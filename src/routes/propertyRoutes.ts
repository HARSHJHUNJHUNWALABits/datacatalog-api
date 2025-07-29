/**
 * Property routes configuration
 *
 * @openapi
 * /api/v1/properties:
 *   get:
 *     summary: Get all properties with pagination and filtering
 *     tags:
 *       - Properties
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
 *           enum: [string, number, boolean]
 *         description: Filter by property type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by property name
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPropertyResponse'
 *   post:
 *     summary: Create a new property
 *     tags:
 *       - Properties
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *     responses:
 *       201:
 *         description: Property created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProperty'
 *       409:
 *         description: Property already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProperty'
 * /api/v1/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProperty'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProperty'
 *   put:
 *     summary: Update an existing property
 *     tags:
 *       - Properties
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
 *             $ref: '#/components/schemas/UpdatePropertyRequest'
 *     responses:
 *       200:
 *         description: Property updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProperty'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProperty'
 *   delete:
 *     summary: Delete a property
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProperty'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseProperty'
 */
import { Router, Request, Response } from 'express';
import { PropertyController } from '../controllers/PropertyController';
import { API_ENDPOINTS } from '../constants';

export function createPropertyRoutes(propertyController: PropertyController): Router {
  const router = Router();

  // GET /api/v1/properties - Get all properties with pagination and filtering
  router.get(API_ENDPOINTS.PROPERTIES, (req: Request, res: Response) => propertyController.getProperties(req, res));

  // POST /api/v1/properties - Create a new property
  router.post(API_ENDPOINTS.PROPERTIES, (req: Request, res: Response) => propertyController.createProperty(req, res));

  // GET /api/v1/properties/:id - Get property by ID
  router.get(`${API_ENDPOINTS.PROPERTIES}/:id`, (req: Request, res: Response) => propertyController.getPropertyById(req, res));

  // PUT /api/v1/properties/:id - Update an existing property
  router.put(`${API_ENDPOINTS.PROPERTIES}/:id`, (req: Request, res: Response) => propertyController.updateProperty(req, res));

  // DELETE /api/v1/properties/:id - Delete a property
  router.delete(`${API_ENDPOINTS.PROPERTIES}/:id`, (req: Request, res: Response) => propertyController.deleteProperty(req, res));

  return router;
} 