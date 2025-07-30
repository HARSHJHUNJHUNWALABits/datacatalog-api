/**
 * TrackingPlan routes configuration
 *
 * @openapi
 * /api/v1/tracking-plans:
 *   get:
 *     summary: Get all tracking plans with pagination and filtering
 *     tags:
 *       - TrackingPlans
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by tracking plan name
 *     responses:
 *       200:
 *         description: List of tracking plans
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTrackingPlanResponse'
 *   post:
 *     summary: Create a new tracking plan
 *     tags:
 *       - TrackingPlans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTrackingPlanRequest'
 *     responses:
 *       201:
 *         description: Tracking plan created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTrackingPlan'
 *       409:
 *         description: Tracking plan already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTrackingPlan'
 * /api/v1/tracking-plans/{id}:
 *   get:
 *     summary: Get tracking plan by ID
 *     tags:
 *       - TrackingPlans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tracking plan found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTrackingPlan'
 *       404:
 *         description: Tracking plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTrackingPlan'
 *   put:
 *     summary: Update an existing tracking plan
 *     tags:
 *       - TrackingPlans
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
 *             $ref: '#/components/schemas/UpdateTrackingPlanRequest'
 *     responses:
 *       200:
 *         description: Tracking plan updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTrackingPlan'
 *       404:
 *         description: Tracking plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTrackingPlan'
 *   delete:
 *     summary: Delete a tracking plan
 *     tags:
 *       - TrackingPlans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tracking plan deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTrackingPlan'
 *       404:
 *         description: Tracking plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseTrackingPlan'
 */
import { Router, Request, Response } from 'express';
import { TrackingPlanController } from '../controllers/TrackingPlanController';
import { API_ENDPOINTS } from '../constants';
import { 
  validateCreateTrackingPlan, 
  validateUpdateTrackingPlan, 
  validateIdParam, 
  validatePagination 
} from '../middleware/validation';
import { authenticateJwt, requireRead, requireWrite, requireDelete } from '../middleware/jwt';

export function createTrackingPlanRoutes(trackingPlanController: TrackingPlanController): Router {
  const router = Router();

  // GET /api/v1/tracking-plans - Get all tracking plans with pagination and filtering
  router.get(API_ENDPOINTS.TRACKING_PLANS, authenticateJwt, requireRead, validatePagination, (req: Request, res: Response) => trackingPlanController.getTrackingPlans(req, res));

  // POST /api/v1/tracking-plans - Create a new tracking plan
  router.post(API_ENDPOINTS.TRACKING_PLANS, authenticateJwt, requireWrite, validateCreateTrackingPlan, (req: Request, res: Response) => trackingPlanController.createTrackingPlan(req, res));

  // GET /api/v1/tracking-plans/:id - Get tracking plan by ID
  router.get(`${API_ENDPOINTS.TRACKING_PLANS}/:id`, authenticateJwt, requireRead, validateIdParam, (req: Request, res: Response) => trackingPlanController.getTrackingPlanById(req, res));

  // PUT /api/v1/tracking-plans/:id - Update an existing tracking plan
  router.put(`${API_ENDPOINTS.TRACKING_PLANS}/:id`, authenticateJwt, requireWrite, validateIdParam, validateUpdateTrackingPlan, (req: Request, res: Response) => trackingPlanController.updateTrackingPlan(req, res));

  // DELETE /api/v1/tracking-plans/:id - Delete a tracking plan
  router.delete(`${API_ENDPOINTS.TRACKING_PLANS}/:id`, authenticateJwt, requireDelete, validateIdParam, (req: Request, res: Response) => trackingPlanController.deleteTrackingPlan(req, res));

  return router;
} 