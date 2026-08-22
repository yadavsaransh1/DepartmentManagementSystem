/**
 * Centralized API Client Utility
 * All API calls should use functions from this file instead of hardcoding URLs
 * 
 * Usage:
 * import { apiCall, API_BASE_URL } from '@/utils/apiClient';
 * 
 * await apiCall('GET', '/api/subjects');
 * await apiCall('POST', '/api/assignments', formData);
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const PHI_API_BASE_URL = import.meta.env.VITE_PHI_API_BASE_URL || 'http://localhost:5000';

/**
 * Generic API call function
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} endpoint - API endpoint (e.g., '/api/subjects')
 * @param {any} body - Request body (for POST/PUT)
 * @param {object} options - Additional fetch options
 * @returns {Promise} Response data
 */
export async function apiCall(method, endpoint, body = null, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    if (body instanceof FormData) {
      delete config.headers['Content-Type'];
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json().catch(() => response);
}

/**
 * GET request
 */
export function apiGet(endpoint, options = {}) {
  return apiCall('GET', endpoint, null, options);
}

/**
 * POST request
 */
export function apiPost(endpoint, body, options = {}) {
  return apiCall('POST', endpoint, body, options);
}

/**
 * PUT request
 */
export function apiPut(endpoint, body, options = {}) {
  return apiCall('PUT', endpoint, body, options);
}

/**
 * DELETE request
 */
export function apiDelete(endpoint, options = {}) {
  return apiCall('DELETE', endpoint, null, options);
}

/**
 * PATCH request
 */
export function apiPatch(endpoint, body, options = {}) {
  return apiCall('PATCH', endpoint, body, options);
}

/**
 * Raw fetch for specific needs (file downloads, etc.)
 */
export function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, { credentials: 'include', ...options });
}

/**
 * Build URL with API base
 * Useful when you need just the URL without fetching
 */
export function apiUrl(endpoint) {
  return `${API_BASE_URL}${endpoint}`;
}
