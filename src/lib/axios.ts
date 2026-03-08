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
    const accessToken = localStorage.getItem("arovia_access_token");
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

    // Skip refresh for auth endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("arovia_refresh_token");
        const accessToken = localStorage.getItem("arovia_access_token");
        // Silent refresh call
        const response = await axios.post("/api/auth/refresh", {
          accessToken: accessToken || "",
          refreshToken,
        });

        // Save the new tokens
        if (response.data.accessToken) {
          localStorage.setItem(
            "arovia_access_token",
            response.data.accessToken,
          );
        }
        if (response.data.refreshToken) {
          localStorage.setItem(
            "arovia_refresh_token",
            response.data.refreshToken,
          );
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear storage and redirect to login
        localStorage.removeItem("arovia_user");
        localStorage.removeItem("arovia_access_token");
        localStorage.removeItem("arovia_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
