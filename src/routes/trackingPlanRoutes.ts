/**
 * TrackingPlan routes configuration
 */
import { Router, Request, Response } from 'express';
import { TrackingPlanController } from '../controllers/TrackingPlanController';
import { API_ENDPOINTS } from '../constants';

export function createTrackingPlanRoutes(trackingPlanController: TrackingPlanController): Router {
  const router = Router();

  // GET /api/v1/tracking-plans - Get all tracking plans with pagination and filtering
  router.get(API_ENDPOINTS.TRACKING_PLANS, (req: Request, res: Response) => trackingPlanController.getTrackingPlans(req, res));

  // POST /api/v1/tracking-plans - Create a new tracking plan
  router.post(API_ENDPOINTS.TRACKING_PLANS, (req: Request, res: Response) => trackingPlanController.createTrackingPlan(req, res));

  // GET /api/v1/tracking-plans/:id - Get tracking plan by ID
  router.get(`${API_ENDPOINTS.TRACKING_PLANS}/:id`, (req: Request, res: Response) => trackingPlanController.getTrackingPlanById(req, res));

  // PUT /api/v1/tracking-plans/:id - Update an existing tracking plan
  router.put(`${API_ENDPOINTS.TRACKING_PLANS}/:id`, (req: Request, res: Response) => trackingPlanController.updateTrackingPlan(req, res));

  // DELETE /api/v1/tracking-plans/:id - Delete a tracking plan
  router.delete(`${API_ENDPOINTS.TRACKING_PLANS}/:id`, (req: Request, res: Response) => trackingPlanController.deleteTrackingPlan(req, res));

  return router;
} 