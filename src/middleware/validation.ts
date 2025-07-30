/**
 * Validation middleware for Express routes
 * Handles input validation at the router layer
 */
import { Request, Response, NextFunction } from 'express';
import { validationSchemas, validateData } from '../utils/validation';
import { ValidationResult } from '../types';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '../constants';

/**
 * Validation middleware factory
 * @param schema - Joi schema to validate against
 * @param dataSource - Where to get the data from ('body', 'query', 'params')
 * @returns Express middleware function
 */
export function validateRequest(schema: any, dataSource: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[dataSource];
    const validationResult: ValidationResult = validateData(data, schema);

    if (!validationResult.isValid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: validationResult.errors.map(err => `${err.field}: ${err.message}`).join(', '),
        details: validationResult.errors,
      });
      return;
    }

    next();
  };
}

/**
 * Validation middleware for event creation
 */
export const validateCreateEvent = validateRequest(validationSchemas.event, 'body');

/**
 * Validation middleware for event update
 */
export const validateUpdateEvent = validateRequest(validationSchemas.event, 'body');

/**
 * Validation middleware for property creation
 */
export const validateCreateProperty = validateRequest(validationSchemas.property, 'body');

/**
 * Validation middleware for property update
 */
export const validateUpdateProperty = validateRequest(validationSchemas.property, 'body');

/**
 * Validation middleware for tracking plan creation
 */
export const validateCreateTrackingPlan = validateRequest(validationSchemas.trackingPlan, 'body');

/**
 * Validation middleware for tracking plan update
 */
export const validateUpdateTrackingPlan = validateRequest(validationSchemas.trackingPlan, 'body');

/**
 * Validation middleware for pagination parameters
 */
export const validatePagination = validateRequest(validationSchemas.pagination, 'query');

/**
 * Validation middleware for ID parameter
 */
export const validateIdParam = validateRequest(
  require('joi').object({
    id: require('joi').number().integer().min(1).required(),
  }),
  'params'
);

/**
 * Validation middleware for token generation
 */
export const validateTokenGeneration = validateRequest(
  require('joi').object({
    api_key: require('joi').string().required(),
    permissions: require('joi').array().items(
      require('joi').string().valid('read', 'write', 'delete')
    ).optional(),
  }),
  'body'
); 