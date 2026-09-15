import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { AccessDeniedPage } from "../pages/AccessDeniedPage.jsx";

export function ProtectedRoute({ 
  children, 
  allowedPath, 
  requiredPermission,
  requiredRole 
}) {
  const { user, isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  // If not logged in, redirect to login with return path
  if (!isAuthenticated || !user) {
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // Check route-level permissions if allowedPath specified
  if (allowedPath && user.allowedRoutes) {
    const isPathAllowed = user.allowedRoutes.includes(allowedPath);
    if (!isPathAllowed) {
      return (
        <AccessDeniedPage 
          customMessage={`Your clinical role (${user.roleTitle || user.role}) does not have access to the ${allowedPath} section under current study governance policies.`} 
        />
      );
    }
  }

  // Check required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDeniedPage customMessage={`Access requires authorization: ${requiredPermission}.`} />;
  }

  // Check required role
  if (requiredRole && user.role !== requiredRole) {
    return <AccessDeniedPage customMessage={`This section requires the ${requiredRole} role.`} />;
  }

  return <>{children}</>;
}
