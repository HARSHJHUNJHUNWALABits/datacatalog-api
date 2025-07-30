/**
 * Generic error handler utility
 * Provides standardized error handling across the application
 */
import { ApiResponse } from '../types';
import { ERROR_MESSAGES } from '../constants';

/**
 * Creates a standardized error response
 * @param error - The error object
 * @param customError - Optional custom error message
 * @returns ApiResponse with error details
 */
export function createErrorResponse<T = any>(
  error: unknown, 
  customError?: string
): ApiResponse<T> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return {
    success: false,
    error: customError || ERROR_MESSAGES.INTERNAL_ERROR,
    message: errorMessage,
  };
}

/**
 * Handles async operations with standardized error handling
 * @param operation - The async operation to execute
 * @param customError - Optional custom error message
 * @returns Promise<ApiResponse<T>> - Standardized API response
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  customError?: string
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return createErrorResponse<T>(error, customError);
  }
}

/**
 * Handles async operations that return success/failure responses
 * @param operation - The async operation to execute
 * @param successMessage - Optional success message
 * @param customError - Optional custom error message
 * @returns Promise<ApiResponse<T>> - Standardized API response
 */
export async function handleAsyncOperationWithMessage<T>(
  operation: () => Promise<T>,
  successMessage?: string,
  customError?: string
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();
    return {
      success: true,
      data: result,
      message: successMessage,
    };
  } catch (error) {
    return createErrorResponse<T>(error, customError);
  }
}

/**
 * Handles async operations that may return null (for not found scenarios)
 * @param operation - The async operation to execute
 * @param notFoundError - Error message when result is null
 * @param customError - Optional custom error message
 * @returns Promise<ApiResponse<T>> - Standardized API response
 */
export async function handleAsyncOperationWithNullCheck<T>(
  operation: () => Promise<T | null>,
  notFoundError: string,
  customError?: string
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();
    
    if (!result) {
      return {
        success: false,
        error: notFoundError,
      };
    }
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return createErrorResponse<T>(error, customError);
  }
}

/**
 * Handles async operations that may return null with success message
 * @param operation - The async operation to execute
 * @param notFoundError - Error message when result is null
 * @param successMessage - Optional success message
 * @param customError - Optional custom error message
 * @returns Promise<ApiResponse<T>> - Standardized API response
 */
export async function handleAsyncOperationWithNullCheckAndMessage<T>(
  operation: () => Promise<T | null>,
  notFoundError: string,
  successMessage?: string,
  customError?: string
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();
    
    if (!result) {
      return {
        success: false,
        error: notFoundError,
      };
    }
    
    return {
      success: true,
      data: result,
      message: successMessage,
    };
  } catch (error) {
    return createErrorResponse<T>(error, customError);
  }
}

/**
 * Handles boolean operations (like delete operations)
 * @param operation - The async operation that returns boolean
 * @param notFoundError - Error message when operation returns false
 * @param successMessage - Optional success message
 * @param customError - Optional custom error message
 * @returns Promise<ApiResponse<null>> - Standardized API response
 */
export async function handleBooleanOperation(
  operation: () => Promise<boolean>,
  notFoundError: string,
  successMessage?: string,
  customError?: string
): Promise<ApiResponse<null>> {
  try {
    const result = await operation();
    
    if (!result) {
      return {
        success: false,
        error: notFoundError,
      };
    }
    
    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    return createErrorResponse<null>(error, customError);
  }
} 