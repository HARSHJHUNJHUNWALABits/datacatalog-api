/**
 * Simplified JWT utilities for API key authentication
 */
import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d'; // 30 days default

/**
 * JWT payload interface
 */
export interface JwtPayload {
  api_key: string;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for API access
 * @param apiKey - API key identifier
 * @param permissions - Array of permissions (e.g., ['read', 'write'])
 * @returns string - JWT token
 */
export function generateToken(apiKey: string, permissions: string[] = ['read']): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    api_key: apiKey,
    permissions,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @returns JwtPayload | null - Decoded payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token has required permission
 * @param token - JWT token
 * @param requiredPermission - Permission required
 * @returns boolean - True if token has required permission
 */
export function hasPermission(token: string, requiredPermission: string): boolean {
  const payload = verifyToken(token);
  if (!payload) return false;
  
  return payload.permissions.includes(requiredPermission);
}

/**
 * Check if token has any of the required permissions
 * @param token - JWT token
 * @param requiredPermissions - Array of permissions (any one is sufficient)
 * @returns boolean - True if token has any required permission
 */
export function hasAnyPermission(token: string, requiredPermissions: string[]): boolean {
  const payload = verifyToken(token);
  if (!payload) return false;
  
  return requiredPermissions.some(permission => payload.permissions.includes(permission));
}

/**
 * Check if token has all required permissions
 * @param token - JWT token
 * @param requiredPermissions - Array of permissions (all required)
 * @returns boolean - True if token has all required permissions
 */
export function hasAllPermissions(token: string, requiredPermissions: string[]): boolean {
  const payload = verifyToken(token);
  if (!payload) return false;
  
  return requiredPermissions.every(permission => payload.permissions.includes(permission));
}

/**
 * Extract API key from token
 * @param token - JWT token
 * @returns string | null - API key or null if invalid
 */
export function getApiKey(token: string): string | null {
  const payload = verifyToken(token);
  return payload?.api_key || null;
}

/**
 * Get token expiration time
 * @param token - JWT token
 * @returns Date | null - Expiration date or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return new Date(payload.exp * 1000);
}

/**
 * Check if token is expired
 * @param token - JWT token
 * @returns boolean - True if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  return expiration < new Date();
}

/**
 * Generate a sample token for testing
 * @returns string - Sample JWT token
 */
export function generateSampleToken(): string {
  return generateToken('sample-api-key', ['read', 'write', 'delete']);
}

/**
 * Generate a read-only token for testing
 * @returns string - Read-only JWT token
 */
export function generateReadOnlyToken(): string {
  return generateToken('read-only-key', ['read']);
} 