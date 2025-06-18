// API Configuration
export const API_BASE_URL = 'https://event-management-web-app-production-bee8.up.railway.app';

// Helper function to create API URLs
export const createApiUrl = (endpoint) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
};
