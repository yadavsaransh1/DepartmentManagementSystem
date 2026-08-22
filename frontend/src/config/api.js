// API Configuration - Centralized backend URL management
// Backend URL is read from environment variables (.env files)
// Default to localhost if not specified

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Home Page APIs
export const HOME_PAGE_ENDPOINTS = {
  CONTENT: `${API_BASE_URL}/api/home-page/content`,
  FACULTY: `${API_BASE_URL}/api/home-page/faculty`,
  FACULTY_BY_ID: (id) => `${API_BASE_URL}/api/home-page/faculty/${id}`,
  TEACHING_ASSISTANT: `${API_BASE_URL}/api/home-page/teaching-assistant`,
  TEACHING_ASSISTANT_BY_ID: (id) => `${API_BASE_URL}/api/home-page/teaching-assistant/${id}`,
  TECHNICAL_STAFF: `${API_BASE_URL}/api/home-page/technical-staff`,
  TECHNICAL_STAFF_BY_ID: (id) => `${API_BASE_URL}/api/home-page/technical-staff/${id}`,
  NON_TEACHING_EMPLOYEE: `${API_BASE_URL}/api/home-page/non-teaching-employee`,
  NON_TEACHING_EMPLOYEE_BY_ID: (id) => `${API_BASE_URL}/api/home-page/non-teaching-employee/${id}`,
  CAROUSEL_IMAGES: `${API_BASE_URL}/api/home-page-images/carousel`,
  ALL_HOME_PAGE_IMAGES: `${API_BASE_URL}/api/home-page-images`,
  HOME_PAGE_IMAGES_BY_ID: (id) => `${API_BASE_URL}/api/home-page-images/${id}`,
  HOME_PAGE_IMAGES_TOGGLE: (id) => `${API_BASE_URL}/api/home-page-images/${id}/toggle-active`,
};

// Notice API
export const NOTICE_ENDPOINTS = {
  ALL_NOTICES: `${API_BASE_URL}/api/notices/all`,
  UPLOAD: `${API_BASE_URL}/api/notices/upload`,
  DOWNLOAD: (id) => `${API_BASE_URL}/api/notices/download/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/api/notices/${id}`,
  DELETE: (id) => `${API_BASE_URL}/api/notices/${id}`,
  TOGGLE: (id) => `${API_BASE_URL}/api/notices/${id}/toggle`,
  BY_TAG: (tag) => `${API_BASE_URL}/api/notices/tag/${tag}`,
};

// Other common endpoints (update as needed)
export const API_ENDPOINTS = {
  ASSIGNMENTS: `${API_BASE_URL}/api/assignments`,
  PROGRAMS: `${API_BASE_URL}/api/programs`,
  // Add more endpoints as needed
};
