import React from "react";
import { useAuth } from "./AuthContext.jsx";
import { Lock } from "lucide-react";

/**
 * PermissionGate: Conditionally renders UI elements based on user permissions or roles.
 * 
 * Usage:
 * <PermissionGate permission="APPROVE_CAPA" renderDisabled lockTitle="Requires Sponsor authorization">
 *   <button ...>Approve CAPA</button>
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  role,
  roles,
  siteId,
  fallback = null,
  renderDisabled = false,
  lockTitle,
  children
}) {
  const { user, hasPermission } = useAuth();

  if (!user) return fallback;

  let isAuthorized = true;

  // Check single permission
  if (permission && !hasPermission(permission)) {
    isAuthorized = false;
  }

  // Check multiple permissions (AND)
  if (permissions && permissions.length > 0) {
    const hasAll = permissions.every((p) => hasPermission(p));
    if (!hasAll) isAuthorized = false;
  }

  // Check single role
  if (role && user.role !== role) {
    isAuthorized = false;
  }

  // Check multiple roles (OR)
  if (roles && roles.length > 0) {
    const hasAnyRole = roles.includes(user.role);
    if (!hasAnyRole) isAuthorized = false;
  }

  // Check site scoping if siteId is given
  if (siteId && user.assignedSite && user.assignedSite !== siteId) {
    isAuthorized = false;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (renderDisabled) {
    return (
      <div 
        className="relative group inline-flex items-center cursor-not-allowed"
        title={lockTitle || "Action restricted for current role"}
      >
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
        <span className="absolute -top-1 -right-1 bg-amber-100 text-amber-800 border border-amber-300 p-0.5 rounded-full shadow-xs">
          <Lock className="w-2.5 h-2.5" />
        </span>
      </div>
    );
  }

  return fallback;
}
