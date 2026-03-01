import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { AuthResponse, UserDto } from "./types";
import axios from "axios";

interface AuthContextType {
  user: UserDto | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = useCallback((data: AuthResponse) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem("carenexa_access_token", data.accessToken);
    localStorage.setItem("carenexa_refresh_token", data.refreshToken);
    localStorage.setItem("carenexa_user", JSON.stringify(data.user));
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("carenexa_refresh_token");
    if (refreshToken) {
      try {
        await axios.post("/api/auth/logout", { refreshToken });
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("carenexa_access_token");
    localStorage.removeItem("carenexa_refresh_token");
    localStorage.removeItem("carenexa_user");
  }, []);

  const refresh = useCallback(async () => {
    const refreshToken = localStorage.getItem("carenexa_refresh_token");
    const currentAccessToken = localStorage.getItem("carenexa_access_token");
    if (!refreshToken) return;

    try {
      const response = await axios.post<AuthResponse>("/api/auth/refresh", {
        accessToken: currentAccessToken || "",
        refreshToken,
      });
      login(response.data);
    } catch (err) {
      console.warn("Refresh token expired or invalid, logging out.");
      logout();
    }
  }, [login, logout]);

  useEffect(() => {
    const storedUser = localStorage.getItem("carenexa_user");
    const storedToken = localStorage.getItem("carenexa_access_token");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedToken) {
        setAccessToken(storedToken);
      } else {
        // Initial refresh to get access token if missing
        refresh();
      }
    }
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, accessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
