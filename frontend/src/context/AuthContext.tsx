"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "Admin" | "Manager" | "Employee";

export type User = {
  id: number;
  name: string;
  username: string;
  role: Role;
  department: string;
  initials: string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasAccess: (allowedRoles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  hasAccess: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("flowsync_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  const login = (u: User) => {
    setUser(u);
    sessionStorage.setItem("flowsync_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("flowsync_user");
  };

  const hasAccess = (allowedRoles: Role[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  // Avoid hydration mismatch - render nothing until client-side state is loaded
  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
