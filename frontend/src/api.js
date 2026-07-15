// src/api.js - Connected to your real Node.js & PostgreSQL backend!

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const UPLOADS_URL = BASE_URL.replace('/api', '/uploads');



const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: 'include', // 🟢 Automatically sends secure cookies
      });

      // Handle 401 globally
      if (response.status === 401) {
        console.warn("🔐 Unauthorized access detected. Clearing session and redirecting to login...");
        localStorage.removeItem('fohow_admin_role');
        localStorage.removeItem('fohow_admin_user');
        window.location.href = '/eden-secure-portal-hq/login';
        return { data: null, ok: false };
      }

      const json = await response.json();
      return { data: json.data !== undefined ? json.data : json, ok: response.ok, raw: json };

    } catch (error) {
      console.error("API GET Error:", error);
      return { data: null, ok: false };
    }
  },

  post: async (endpoint, bodyData) => {
    try {
      const isFormData = bodyData instanceof FormData;
      
      const options = {
        method: 'POST',
        credentials: 'include',
      };

      if (isFormData) {
        options.body = bodyData;
        // Don't set Content-Type, fetch will set it automatically with boundaries for FormData
      } else {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(bodyData);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (response.status === 401) {
        console.warn("🔐 Session expired. Logging out...");
        window.location.href = '/eden-secure-portal-hq/login';
        return { data: { error: "Session expired" }, ok: false };
      }

      const json = await response.json();
      return { data: json.data !== undefined ? json.data : json, ok: response.ok, raw: json };

    } catch (error) {
      console.error("API POST Error:", error);
      return { data: { error: "Network error" }, ok: false };
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.status === 401) {
        window.location.href = '/eden-secure-portal-hq/login';
        return { data: { error: "Session expired" }, ok: false };
      }

      const json = await response.json();
      return { data: json.data !== undefined ? json.data : json, ok: response.ok, raw: json };
    } catch (error) {
      console.error("API DELETE Error:", error);
      return { data: { error: "Network error" }, ok: false };
    }
  },

  put: async (endpoint, bodyData) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
        credentials: 'include',
      });

      if (response.status === 401) {
        window.location.href = '/eden-secure-portal-hq/login';
        return { data: { error: "Session expired" }, ok: false };
      }

      const json = await response.json();
      return { data: json.data !== undefined ? json.data : json, ok: response.ok, raw: json };
    } catch (error) {
      console.error("API PUT Error:", error);
      return { data: { error: "Network error" }, ok: false };
    }
  },

  sendForm: async (endpoint, method, formData) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: method,
        credentials: 'include',
        body: formData,
      });
      const json = await response.json();
      return { data: json, ok: response.ok };
    } catch (error) {
      console.error("API Form Error:", error);
      return { data: { error: "Network error" }, ok: false };
    }
  },

  /**
   * 🟢 Production Grade Helper:
   * Resolves the full URL for images stored on the backend.
   * Eliminates hardcoded 'localhost:5001' throughout the app.
   */
  getImageUrl: (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const backendBase = BASE_URL.replace('/api', '');
    return `${backendBase}${path}`;
  }
};

export default api;
