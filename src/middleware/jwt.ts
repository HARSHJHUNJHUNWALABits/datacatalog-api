/**
 * Simplified JWT middleware for API key authentication
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken, hasPermission, hasAnyPermission, JwtPayload } from '../utils/jwt';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '../constants';

/**
 * Extended request interface with JWT payload
 */
export interface JwtRequest extends Request {
  jwt?: JwtPayload;
}

/**
 * Extract JWT token from request headers
 * @param req - Express request object
 * @returns string | null - JWT token or null if not found
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * JWT authentication middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function authenticateJwt(
  req: JwtRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
        message: 'JWT token is required',
      });
      return;
    }

    const payload = verifyToken(token);

    if (!payload) {
      res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
        message: 'Invalid or expired JWT token',
      });
      return;
    }

    // Add JWT payload to request object
    req.jwt = payload;
    next();
  } catch (error) {
    res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
      message: 'Authentication failed',
    });
  }
}

/**
 * Permission-based authorization middleware
 * @param requiredPermission - Permission required to access the endpoint
 * @returns Express middleware function
 */
export function requirePermission(requiredPermission: string) {
  return (req: JwtRequest, res: Response, next: NextFunction): void => {
    try {
      const token = extractToken(req);

      if (!token) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          error: ERROR_MESSAGES.UNAUTHORIZED,
          message: 'JWT token is required',
        });
        return;
      }

      if (!hasPermission(token, requiredPermission)) {
        res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
          success: false,
          error: ERROR_MESSAGES.FORBIDDEN,
          message: `Insufficient permissions. Required permission: ${requiredPermission}`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
        message: 'Authorization failed',
      });
    }
  };
}

/**
 * Multiple permissions authorization middleware (any permission is sufficient)
 * @param requiredPermissions - Array of permissions (any one is sufficient)
 * @returns Express middleware function
 */
export function requireAnyPermission(requiredPermissions: string[]) {
  return (req: JwtRequest, res: Response, next: NextFunction): void => {
    try {
      const token = extractToken(req);

      if (!token) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          error: ERROR_MESSAGES.UNAUTHORIZED,
          message: 'JWT token is required',
        });
        return;
      }

      if (!hasAnyPermission(token, requiredPermissions)) {
        res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
          success: false,
          error: ERROR_MESSAGES.FORBIDDEN,
          message: `Insufficient permissions. Required permissions: ${requiredPermissions.join(', ')}`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(HTTP_STATUS_CODES.FORBIDDEN).json({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
        message: 'Authorization failed',
      });
    }
  };
}

/**
 * Optional JWT authentication middleware - adds JWT payload if token is valid
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function optionalJwt(
  req: JwtRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        req.jwt = payload;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

/**
 * Read permission middleware
 */
export const requireRead = requirePermission('read');

/**
 * Write permission middleware
 */
export const requireWrite = requirePermission('write');

/**
 * Delete permission middleware
 */
export const requireDelete = requirePermission('delete');

/**
 * Admin permission middleware (requires all permissions)
 */
export const requireAdmin = requireAnyPermission(['read', 'write', 'delete']); 