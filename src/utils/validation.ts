/**
 * Validation utilities using Joi
 * Follows SOLID principles - Single Responsibility Principle
 */
import Joi from 'joi';
import { ValidationResult, ValidationError } from '../types';
import { EVENT_TYPES, PROPERTY_TYPES, VALIDATION_RULES } from '../constants';

/**
 * Tracking plan property validation schema
 */
const trackingPlanPropertySchema = Joi.object({
  name: Joi.string()
    .max(VALIDATION_RULES.NAME_MAX_LENGTH)
    .required()
    .messages({
      'string.empty': 'Property name is required',
      'string.max': `Property name must be at most ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
      'any.required': 'Property name is required',
    }),
  type: Joi.string()
    .valid(...PROPERTY_TYPES)
    .required()
    .messages({
      'any.only': `Property type must be one of: ${PROPERTY_TYPES.join(', ')}`,
      'any.required': 'Property type is required',
    }),
  required: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Property required field is required',
    }),
  description: Joi.string()
    .max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH)
    .required()
    .messages({
      'string.empty': 'Property description is required',
      'string.max': `Property description must be at most ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
      'any.required': 'Property description is required',
    }),
});

/**
 * Tracking plan event validation schema
 */
const trackingPlanEventSchema = Joi.object({
  name: Joi.string()
    .max(VALIDATION_RULES.NAME_MAX_LENGTH)
    .required()
    .messages({
      'string.empty': 'Event name is required',
      'string.max': `Event name must be at most ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
      'any.required': 'Event name is required',
    }),
  description: Joi.string()
    .max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH)
    .required()
    .messages({
      'string.empty': 'Event description is required',
      'string.max': `Event description must be at most ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
      'any.required': 'Event description is required',
    }),
  properties: Joi.array()
    .items(trackingPlanPropertySchema)
    .required()
    .messages({
      'any.required': 'Event properties are required',
      'array.base': 'Event properties must be an array',
    }),
  additionalProperties: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Event additionalProperties field is required',
    }),
});

/**
 * Validation schemas for different entities
 */
export const validationSchemas = {
  // Event validation schema
  event: Joi.object({
    name: Joi.string()
      .max(VALIDATION_RULES.NAME_MAX_LENGTH)
      .required()
      .messages({
        'string.empty': 'Event name is required',
        'string.max': `Event name must be at most ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
        'any.required': 'Event name is required',
      }),
    type: Joi.string()
      .valid(...EVENT_TYPES)
      .required()
      .messages({
        'any.only': `Event type must be one of: ${EVENT_TYPES.join(', ')}`,
        'any.required': 'Event type is required',
      }),
    description: Joi.string()
      .max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH)
      .required()
      .messages({
        'string.empty': 'Event description is required',
        'string.max': `Event description must be at most ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
        'any.required': 'Event description is required',
      }),
  }),

  // Property validation schema
  property: Joi.object({
    name: Joi.string()
      .max(VALIDATION_RULES.NAME_MAX_LENGTH)
      .required()
      .messages({
        'string.empty': 'Property name is required',
        'string.max': `Property name must be at most ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
        'any.required': 'Property name is required',
      }),
    type: Joi.string()
      .valid(...PROPERTY_TYPES)
      .required()
      .messages({
        'any.only': `Property type must be one of: ${PROPERTY_TYPES.join(', ')}`,
        'any.required': 'Property type is required',
      }),
    description: Joi.string()
      .max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH)
      .required()
      .messages({
        'string.empty': 'Property description is required',
        'string.max': `Property description must be at most ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
        'any.required': 'Property description is required',
      }),
    validation_rules: Joi.object().optional(),
  }),

  // Tracking plan property validation schema
  trackingPlanProperty: trackingPlanPropertySchema,

  // Tracking plan event validation schema
  trackingPlanEvent: trackingPlanEventSchema,

  // Tracking plan validation schema
  trackingPlan: Joi.object({
    name: Joi.string()
      .max(VALIDATION_RULES.TRACKING_PLAN_NAME_MAX_LENGTH)
      .required()
      .messages({
        'string.empty': 'Tracking plan name is required',
        'string.max': `Tracking plan name must be at most ${VALIDATION_RULES.TRACKING_PLAN_NAME_MAX_LENGTH} characters`,
        'any.required': 'Tracking plan name is required',
      }),
    description: Joi.string()
      .max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH)
      .required()
      .messages({
        'string.empty': 'Tracking plan description is required',
        'string.max': `Tracking plan description must be at most ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
        'any.required': 'Tracking plan description is required',
      }),
    events: Joi.array()
      .items(trackingPlanEventSchema)
      .min(1)
      .required()
      .messages({
        'any.required': 'Tracking plan events are required',
        'array.base': 'Tracking plan events must be an array',
        'array.min': 'Tracking plan must have at least one event',
      }),
  }),

  // Pagination validation schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

/**
 * Validate data against a schema
 * @param data - Data to validate
 * @param schema - Joi schema to validate against
 * @returns ValidationResult - Validation result with errors if any
 */
export function validateData<T>(data: T, schema: Joi.Schema): ValidationResult {
  const { error } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors: ValidationError[] = error.details.map((detail: any) => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Validate event data
 * @param data - Event data to validate
 * @returns ValidationResult - Validation result
 */
export function validateEvent(data: any): ValidationResult {
  return validateData(data, validationSchemas.event);
}

/**
 * Validate property data
 * @param data - Property data to validate
 * @returns ValidationResult - Validation result
 */
export function validateProperty(data: any): ValidationResult {
  return validateData(data, validationSchemas.property);
}

/**
 * Validate tracking plan data
 * @param data - Tracking plan data to validate
 * @returns ValidationResult - Validation result
 */
export function validateTrackingPlan(data: any): ValidationResult {
  return validateData(data, validationSchemas.trackingPlan);
}

/**
 * Validate pagination parameters
 * @param data - Pagination data to validate
 * @returns ValidationResult - Validation result
 */
export function validatePagination(data: any): ValidationResult {
  return validateData(data, validationSchemas.pagination);
} 