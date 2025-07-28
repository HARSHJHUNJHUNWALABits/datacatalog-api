/**
 * Property routes configuration
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