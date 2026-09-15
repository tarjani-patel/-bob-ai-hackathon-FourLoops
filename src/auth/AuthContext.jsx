import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  getCurrentSession, 
  saveSession, 
  clearSession, 
  authenticateUser, 
  registerUser,
  getStoredUsers
} from "./authStorage.js";
import { ROLES, ROLE_DEFINITIONS } from "./roleConfig.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize authenticated user from localStorage session if available
  const [user, setUser] = useState(() => getCurrentSession());

  // Keep localStorage session synchronized
  useEffect(() => {
    saveSession(user);
  }, [user]);

  // Register a new user account
  const register = useCallback(({ name, email, password, role, assignedSite, organization }) => {
    const newUser = registerUser({
      name,
      email,
      password,
      role,
      assignedSite,
      organization
    });
    return newUser;
  }, []);

  // Login handler using email and password
  const login = useCallback((email, password) => {
    const authenticatedSession = authenticateUser(email, password);
    setUser(authenticatedSession);
    return authenticatedSession;
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    clearSession();
  }, []);

  // Granular capability check
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const can = hasPermission;

  // Convenience boolean helpers
  const isCRA = user?.role === ROLES.CRA;
  const isInvestigator = user?.role === ROLES.INVESTIGATOR;
  const isDataManager = user?.role === ROLES.DATA_MANAGER;
  const isSponsor = user?.role === ROLES.SPONSOR;

  const roleMeta = user?.role ? ROLE_DEFINITIONS[user.role] : null;

  const value = {
    user,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    roleTitle: roleMeta?.label || user?.roleTitle || "User",
    roleMeta,
    assignedSite: user?.assignedSite || null,
    hasPermission,
    can,
    login,
    register,
    logout,
    getStoredUsers,
    isCRA,
    isInvestigator,
    isDataManager,
    isSponsor
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
