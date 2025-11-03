import axios from 'axios';

/**
 * Utility function to check if the backend API is reachable
 * @returns Promise<boolean> - True if API is reachable, false otherwise
 */
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
    console.log('Testing connection to API:', API_BASE_URL);
    
    // Try to reach the health endpoint
    const response = await axios.get(`${API_BASE_URL.replace(/\/api\/?$/, '')}/api/health`, {
      timeout: 5000, // 5 second timeout for quick check
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    
    console.log('API connection test result:', response.status, response.data);
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

/**
 * Gets a user-friendly message about connection issues
 */
export const getConnectionTroubleshootingSteps = (): string => {
  return `
Connection issues detected. Please try the following:
1. Make sure the backend server is running (npm run dev in the backend folder)
2. Check if the correct API URL is set in your .env file (REACT_APP_API_URL)
3. Try accessing the API directly in your browser: http://localhost:5003/api/health
4. Check for any network or firewall issues that might be blocking the connection
5. If using a VPN, try disconnecting it
6. Try using 127.0.0.1 instead of localhost in your browser and API URL
  `;
};
