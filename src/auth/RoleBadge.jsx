import React from "react";
import { ROLES, ROLE_CONFIG } from "./roleConfig.js";

/**
 * RoleBadge: Standardized role chip with role color coding and optional site scope
 */
export function RoleBadge({ role, assignedSite, size = "md", className = "" }) {
  const config = ROLE_CONFIG[role] || {
    label: role || "User",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400"
  };

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-xs font-semibold px-3 py-1.5 gap-2"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.badgeColor} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
      <span>{config.label}</span>
      {assignedSite && role === ROLES.INVESTIGATOR && (
        <span className="ml-0.5 px-1.5 py-0.2 bg-purple-200/80 text-purple-900 rounded font-mono text-[10px] font-bold">
          {assignedSite}
        </span>
      )}
    </span>
  );
}
