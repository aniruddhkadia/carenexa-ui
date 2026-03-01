import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("carenexa_access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("carenexa_refresh_token");
        const accessToken = localStorage.getItem("carenexa_access_token");
        // Silent refresh call
        const response = await axios.post("/api/auth/refresh", {
          accessToken: accessToken || "",
          refreshToken,
        });

        // Save the new tokens
        if (response.data.accessToken) {
          localStorage.setItem(
            "carenexa_access_token",
            response.data.accessToken,
          );
        }
        if (response.data.refreshToken) {
          localStorage.setItem(
            "carenexa_refresh_token",
            response.data.refreshToken,
          );
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear storage and redirect to login
        localStorage.removeItem("carenexa_user");
        localStorage.removeItem("carenexa_access_token");
        localStorage.removeItem("carenexa_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
