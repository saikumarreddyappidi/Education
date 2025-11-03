import axios from 'axios';

// Candidate API URLs (tries multiple local dev ports to tolerate different backend configs)
const CANDIDATE_API_URLS = [
  process.env.REACT_APP_API_URL,
  process.env.REACT_APP_FALLBACK_API_URL,
  'http://127.0.0.1:5003/api',
  'http://localhost:5003/api',
  'http://127.0.0.1:5000/api',
  'http://localhost:5000/api',
  'http://127.0.0.1:5002/api',
  'http://localhost:5002/api'
].filter(Boolean) as string[];

// Log the API configuration candidates
console.log('API Configuration candidates:', { candidates: CANDIDATE_API_URLS, nodeEnv: process.env.NODE_ENV });

// Function to check if an API URL is reachable
const isApiReachable = async (url: string): Promise<boolean> => {
  try {
    // Extract base URL without /api path
    const baseUrl = url.replace(/\/api\/?$/, '');
    const healthUrl = `${baseUrl}/api/health`;
    
    console.log(`🔍 Testing API connectivity to ${healthUrl}...`);
    
    const startTime = Date.now();
    const response = await axios.get(healthUrl, { 
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ API connectivity test successful for ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${elapsed}ms`,
      data: response.data,
    });
    
    return response.status === 200;
  } catch (error: any) {
    console.error(`❌ API connectivity test failed for ${url}:`, {
      message: error.message,
      code: error.code,
      isAxiosError: error.isAxiosError,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    // Log network diagnostic info
    console.log('🔍 Network diagnostic info:', {
      online: navigator.onLine,
      userAgent: navigator.userAgent,
      url: url,
    });
    
    return false;
  }
};

// Try candidate URLs in order and pick the first reachable. In production, prefer configured URL.
const determineApiUrl = async (): Promise<string> => {
  // If explicitly configured in production, use it
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  for (const candidate of CANDIDATE_API_URLS) {
    try {
      if (await isApiReachable(candidate)) {
        console.log('Using API URL:', candidate);
        return candidate;
      }
    } catch (e) {
      // ignore and try next
    }
  }

  // As a last resort, use the first candidate or a hard-coded localhost:5000
  console.warn('No candidate API URL reachable, defaulting to first candidate or http://127.0.0.1:5000/api');
  return CANDIDATE_API_URLS[0] || 'http://127.0.0.1:5000/api';
};

// Start with the first candidate (or fallback) and we'll update it in background
let ACTIVE_API_URL = CANDIDATE_API_URLS[0] || 'http://127.0.0.1:5000/api';

// Create the API client
const api = axios.create({
  baseURL: ACTIVE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Try to determine the best API URL in the background
(async () => {
  try {
    console.log('🔄 Determining best API URL...');
    ACTIVE_API_URL = await determineApiUrl();
    
    // Update the base URL
    console.log('✅ Setting API base URL to:', ACTIVE_API_URL);
    api.defaults.baseURL = ACTIVE_API_URL;
    
    // Verify API is accessible by making a test request
    try {
      const healthCheck = await api.get('/health');
      console.log('✅ API health check successful:', healthCheck.data);
    } catch (healthError) {
      console.error('❌ API health check failed:', healthError);

      // Try other candidates as fallback and switch to the first reachable one
      for (const candidate of CANDIDATE_API_URLS) {
        if (candidate === ACTIVE_API_URL) continue;
        try {
          const reachable = await isApiReachable(candidate);
          if (reachable) {
            console.log('🔄 Switching to reachable API URL:', candidate);
            ACTIVE_API_URL = candidate;
            api.defaults.baseURL = candidate;
            break;
          }
        } catch (e) {
          // ignore and try next
        }
      }
    }
  } catch (error) {
    console.error('❌ Error determining API URL:', error);
  }
})();

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = config.url || 'UNKNOWN_URL';
    console.log(`🚀 API REQUEST: ${method} ${url}`);
    
    // Add timestamp to URL to prevent caching (for GET requests)
    if (method === 'GET' && url.indexOf('?') === -1) {
      config.url = `${url}?_t=${Date.now()}`;
    } else if (method === 'GET') {
      config.url = `${url}&_t=${Date.now()}`;
    }
    
    // Log request data
    if (config.data) {
      const sanitizedData = { ...config.data };
      // Sanitize potentially large fields for logging
      if (sanitizedData.content && typeof sanitizedData.content === 'string') {
        sanitizedData.content = `${sanitizedData.content.substring(0, 100)}... (${sanitizedData.content.length} chars)`;
      }
      console.log('📦 Request Payload:', sanitizedData);
    }
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in authorization header
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Using auth token:', `${token.substring(0, 15)}...`);
      
      // Debug info
      if (token.length < 20) {
        console.warn('⚠️ Auth token looks unusually short:', token);
      }
      
      try {
        // Decode JWT to check if it's valid (without verification)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const expiryTime = payload.exp ? new Date(payload.exp * 1000) : 'No expiry';
          console.log('🔍 Token info:', {
            userId: payload.userId || payload.id || payload._id || 'Unknown',
            role: payload.role || 'Unknown',
            expires: expiryTime,
            isExpired: payload.exp ? (payload.exp * 1000 < Date.now()) : 'Unknown'
          });
        } else {
          console.warn('⚠️ Token does not appear to be a valid JWT (should have 3 parts)');
        }
      } catch (e) {
        console.warn('⚠️ Failed to decode token for debugging:', e);
      }
    } else {
      console.warn('⚠️ No auth token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and network issues
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase() || 'UNKNOWN';
    const url = response.config.url || 'UNKNOWN_URL';
    console.log(`✅ API RESPONSE SUCCESS: ${method} ${url} (${response.status})`);
    
    // Log abbreviated response data
    const responseData = response.data;
    if (responseData) {
      let sanitizedData;
      
      // Handle different data types appropriately
      if (Array.isArray(responseData)) {
        sanitizedData = `Array with ${responseData.length} items`;
        if (responseData.length > 0) {
          sanitizedData += `, first item keys: ${Object.keys(responseData[0]).join(', ')}`;
        }
      } else if (typeof responseData === 'object') {
        const keys = Object.keys(responseData);
        sanitizedData = `Object with keys: ${keys.join(', ')}`;
        
        // Add note count if it's a common response shape
        if (responseData.notes) {
          sanitizedData += `, notes count: ${responseData.notes.length}`;
        }
      } else {
        sanitizedData = responseData;
      }
      
      console.log('📦 Response Data (abbreviated):', sanitizedData);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API ERROR:', error);
    
    // Get request details for logging
    const config = error.config || {};
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = config.url || 'UNKNOWN_URL';
    
    // Handle network errors (no response)
    if (!error.response) {
      console.error(`❌ NETWORK ERROR: ${method} ${url}`, {
        message: error.message,
        code: error.code,
        isAxiosError: error.isAxiosError,
        baseURL: ACTIVE_API_URL,
        fullError: error,
      });
      
      // Diagnostic info for troubleshooting
      console.log('🔍 API Diagnostic Info:', {
        apiUrl: ACTIVE_API_URL,
        candidates: CANDIDATE_API_URLS,
        hasToken: !!localStorage.getItem('token'),
        userAgent: navigator.userAgent,
        isOnline: navigator.onLine,
      });
      
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection and try again.'
      });
    }
    
    // Log detailed error information
    console.error(`❌ API ERROR: ${method} ${url} (${error.response.status})`, {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      headers: error.response.headers,
    });
    
    // Handle auth errors
    if (error.response?.status === 401) {
      console.log('🔒 Authentication error, redirecting to login');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject({
        ...error,
        message: 'Your session has expired. Please log in again.'
      });
    }
    
    // Enhance error message based on response
    const enhancedError = { ...error };
    if (error.response?.data?.message) {
      enhancedError.message = error.response.data.message;
    } else if (error.response?.status === 404) {
      enhancedError.message = 'Resource not found. Please check your request.';
    } else if (error.response?.status === 500) {
      enhancedError.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(enhancedError);
  }
);

export default api;
