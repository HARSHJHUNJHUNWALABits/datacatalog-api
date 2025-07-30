/**
 * Authentication utilities for JWT token management and password hashing
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JwtPayload, RefreshTokenPayload, UserRole } from '../types/auth';
import { ERROR_MESSAGES } from '../constants';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns Promise<boolean> - True if password matches
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 * @param payload - JWT payload data
 * @returns string - JWT token
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

/**
 * Generate JWT refresh token
 * @param payload - Refresh token payload data
 * @returns string - JWT refresh token
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
}

/**
 * Verify JWT access token
 * @param token - JWT token to verify
 * @returns JwtPayload | null - Decoded payload or null if invalid
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify JWT refresh token
 * @param token - JWT refresh token to verify
 * @returns RefreshTokenPayload | null - Decoded payload or null if invalid
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a random token ID for refresh tokens
 * @returns string - Random token ID
 */
export function generateTokenId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Check if user has required role
 * @param userRole - User's role
 * @param requiredRole - Required role
 * @returns boolean - True if user has required role
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.ADMIN]: 3,
    [UserRole.USER]: 2,
    [UserRole.READONLY]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can perform action on resource
 * @param userRole - User's role
 * @param action - Action being performed
 * @returns boolean - True if user can perform action
 */
export function canPerformAction(userRole: UserRole, action: string): boolean {
  const permissions = {
    [UserRole.ADMIN]: ['read', 'write', 'delete', 'manage_users'],
    [UserRole.USER]: ['read', 'write'],
    [UserRole.READONLY]: ['read'],
  };

  return permissions[userRole]?.includes(action) || false;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns { isValid: boolean; errors: string[] } - Validation result
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user data for response (remove sensitive information)
 * @param user - User object with sensitive data
 * @returns Omit<User, 'password_hash'> - User object without sensitive data
 */
export function sanitizeUser(user: any): Omit<any, 'password_hash'> {
  const { password_hash, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Generate password reset token
 * @param userId - User ID
 * @returns string - Password reset token
 */
export function generatePasswordResetToken(userId: number): string {
  return jwt.sign({ userId, type: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verify password reset token
 * @param token - Password reset token
 * @returns { userId: number } | null - Decoded payload or null if invalid
 */
export function verifyPasswordResetToken(token: string): { userId: number } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type === 'password_reset') {
      return { userId: payload.userId };
    }
    return null;
  } catch (error) {
    return null;
  }
} 