"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "Coordinador PIE" | "Educadora Diferencial" | "Profesor Aula" | string;

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: Role;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateAvatar: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const savedToken = localStorage.getItem("pacia_token");
    const savedUserStr = localStorage.getItem("pacia_user");
    
    if (savedToken && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        setToken(savedToken);
        setUser(savedUser);
        document.documentElement.setAttribute("data-role", savedUser.rol);
      } catch (e) {
        console.error("Failed to parse user session", e);
        // Do not call logout() here because it redirects, just clean up
        localStorage.removeItem("pacia_token");
        localStorage.removeItem("pacia_user");
      }
    }
    setIsLoading(false);

    // Global fetch interceptor for 401 Unauthorized (Expired Tokens)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("pacia_token");
        localStorage.removeItem("pacia_user");
        window.location.href = "/login";
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("pacia_token", newToken);
    localStorage.setItem("pacia_user", JSON.stringify(newUser));
    document.documentElement.setAttribute("data-role", newUser.rol);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("pacia_token");
    localStorage.removeItem("pacia_user");
    document.documentElement.removeAttribute("data-role");
    window.location.href = "/login";
  };

  const updateAvatar = (url: string) => {
    if (user) {
      const updatedUser = { ...user, avatarUrl: url };
      setUser(updatedUser);
      localStorage.setItem("pacia_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
