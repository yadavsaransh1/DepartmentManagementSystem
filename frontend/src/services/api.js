import axios from 'axios';

// Determine API URL based on environment
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  // Fallback: determine from current location
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    API_BASE_URL = `${protocol}//localhost:8080`;
  } else if (hostname === '10.52.9.128') {
    API_BASE_URL = `${protocol}//10.52.9.128:8080`;
  } else {
    // Production: use relative path or same origin
    API_BASE_URL = '';
  }
}

// Ensure API_BASE_URL ends with /api
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL}/api`;
}

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug('DEBUG: Authorization header added to request:', config.url);
  } else {
    console.warn('WARNING: No token found in localStorage for request:', config.url);
  }
  
  // For FormData, let axios set the content-type with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  console.debug('DEBUG: Request config:', { url: config.url, method: config.method, headers: config.headers });
  
  return config;
});

export default api;
