/**
 * IBTU E-Commerce Frontend
 * src/services/api/apiErrorHandler.js
 *
 * Normalizes backend error responses and network exceptions into a
 * structured, user-friendly error object.
 */

export class ApiError extends Error {
  constructor({
    message = 'An unexpected error occurred. Please try again.',
    statusCode = 500,
    errors = null,
    isNetworkError = false,
  }) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
    this.isNetworkError = isNetworkError
  }
}

/**
 * Transforms Axios errors into standardized ApiError instances.
 * @param {object} error - Axios error object
 * @returns {ApiError}
 */
export function handleApiError(error) {
  // 1. Network failure or timeout (backend not reachable)
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
    return new ApiError({
      message:
        'Unable to connect to the IBTU server. Please check your internet connection or ensure the API server is running.',
      statusCode: 0,
      isNetworkError: true,
    })
  }

  // 2. Request timed out
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new ApiError({
      message: 'The request took too long to complete. Please try again.',
      statusCode: 408,
      isNetworkError: true,
    })
  }

  // 3. Backend HTTP response received
  const { status, data } = error.response
  const serverMessage =
    data?.message ||
    (status === 404
      ? 'The requested resource was not found.'
      : status === 403
      ? 'You do not have permission to perform this action.'
      : status === 401
      ? 'Authentication failed or session expired. Please sign in again.'
      : 'A server error occurred. Please try again later.')

  const fieldErrors = Array.isArray(data?.errors) ? data.errors : null

  return new ApiError({
    message: serverMessage,
    statusCode: status,
    errors: fieldErrors,
    isNetworkError: false,
  })
}
