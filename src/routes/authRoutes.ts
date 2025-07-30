/**
 * Authentication routes for JWT token management
 */

/**
 * @openapi
 * /api/v1/auth/token:
 *   post:
 *     summary: Generate a new JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: API key identifier
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [read, write, delete]
 *                 description: Array of permissions for the token
 *             required:
 *               - api_key
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token
 *                     api_key:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     expires_in:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 * /api/v1/auth/verify:
 *   get:
 *     summary: Verify JWT token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     api_key:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     expires_at:
 *                       type: string
 *       401:
 *         description: Invalid or expired token
 */

import { Router, Request, Response } from 'express';
import { generateToken, verifyToken, getTokenExpiration } from '../utils/jwt';
import { validateTokenGeneration } from '../middleware/validation';
import { ERROR_MESSAGES } from '../constants';

export function createAuthRoutes(): Router {
  const router = Router();

  // POST /api/v1/auth/token - Generate JWT token
  router.post('/token', validateTokenGeneration, (req: Request, res: Response) => {
    try {
      const { api_key, permissions = ['read'] } = req.body;

      // Generate token
      const token = generateToken(api_key, permissions);
      const expiration = getTokenExpiration(token);

      res.status(200).json({
        success: true,
        data: {
          token,
          api_key,
          permissions,
          expires_in: process.env.JWT_EXPIRES_IN || '30d',
          expires_at: expiration?.toISOString(),
        },
        message: 'Token generated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: 'Failed to generate token',
      });
    }
  });

  // GET /api/v1/auth/verify - Verify JWT token
  router.get('/verify', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: ERROR_MESSAGES.UNAUTHORIZED,
          message: 'Bearer token is required',
        });
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (!payload) {
        return res.status(401).json({
          success: false,
          error: ERROR_MESSAGES.UNAUTHORIZED,
          message: 'Invalid or expired token',
        });
      }

      const expiration = getTokenExpiration(token);

      return res.status(200).json({
        success: true,
        data: {
          api_key: payload.api_key,
          permissions: payload.permissions,
          expires_at: expiration?.toISOString(),
        },
        message: 'Token is valid',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: 'Failed to verify token',
      });
    }
  });

  return router;
} 