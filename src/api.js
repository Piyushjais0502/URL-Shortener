// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Detect the API base URL
function getApiBaseUrl() {
  // In development, try to detect if backend is running on different ports
  if (isDevelopment) {
    // Check if we're running on Vite dev server (usually 5173)
    const currentPort = window.location.port;
    
    // If we're on a different port, assume backend is on 3001 (our configured port)
    if (currentPort === '5173' || currentPort === '4173') {
      return 'http://localhost:3001';
    }
    
    // Default to localhost:3001 for development
    return 'http://localhost:3001';
  }
  
  // In production, use the current domain with /api prefix
  if (isProduction) {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  
  // Fallback
  return 'http://localhost:3001';
}

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  SHORTEN: `${API_BASE_URL}/shorten`,
  STATUS: `${API_BASE_URL}/test`,
  HEALTH: `${API_BASE_URL}/test`
};

// API utility functions
export async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Specific API functions
export async function shortenUrl(url, shortcode = '', validity = '') {
  const body = { url };
  if (shortcode.trim()) body.shortcode = shortcode.trim();
  // Only add validity if it's actually specified (not empty string or 0)
  if (validity && validity.toString().trim() && parseInt(validity, 10) > 0) {
    body.validity = parseInt(validity, 10);
  }

  return apiRequest(API_ENDPOINTS.SHORTEN, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function checkApiHealth() {
  try {
    return await apiRequest(API_ENDPOINTS.HEALTH);
  } catch (error) {
    console.warn('API health check failed:', error);
    return null;
  }
}

console.log('API Configuration:', {
  baseUrl: API_BASE_URL,
  endpoints: API_ENDPOINTS,
  environment: isDevelopment ? 'development' : 'production'
});