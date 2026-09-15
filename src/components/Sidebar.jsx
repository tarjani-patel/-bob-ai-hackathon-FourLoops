import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  AlertTriangle,
  Building2,
  ShieldCheck,
  BarChart3,
  Settings,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useTrial } from "../context/TrialContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { 
  getVisiblePatients, 
  getVisibleDeviations, 
  getVisibleSites, 
  getVisibleCapas 
} from "../auth/dataScoping.js";
import { RoleBadge } from "../auth/RoleBadge.jsx";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Trial & Protocol", path: "/trial-protocol", icon: FileText },
  { name: "Patients", path: "/patients", icon: Users, badgeKey: "patientsCount" },
  { name: "Deviations", path: "/deviations", icon: AlertTriangle, badgeKey: "deviationsCount", badgeAlert: true },
  { name: "Site Risk", path: "/sites", icon: Building2, badgeKey: "highRiskSites" },
  { name: "CAPA", path: "/capa", icon: ShieldCheck, badgeKey: "capaCount" },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const { deviations, patients, siteRisks, capas } = useTrial();
  const { user } = useAuth();
  const location = useLocation();

  // Scope counts by active role
  const scopedPatients = getVisiblePatients(user, patients);
  const scopedDeviations = getVisibleDeviations(user, deviations);
  const scopedSites = getVisibleSites(user, siteRisks);
  const scopedCapas = getVisibleCapas(user, capas);

  const getBadgeValue = (key) => {
    switch (key) {
      case "patientsCount":
        return scopedPatients.length;
      case "deviationsCount":
        return scopedDeviations.length;
      case "highRiskSites":
        const highCount = scopedSites.filter((s) => s.riskBand === "High").length;
        return highCount > 0 ? `${highCount} High` : null;
      case "capaCount":
        return scopedCapas.length;
      default:
        return null;
    }
  };

  // Filter navigation items by allowed routes for the current user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!user || !user.allowedRoutes) return true;
    return user.allowedRoutes.includes(item.path);
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800 selection:bg-clinical-600">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-clinical-700 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">TrialGuard</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Compliance Copilot</p>
          </div>
        </div>

        {/* Current Study & Role Scope Widget */}
        <div className="mt-4 p-2.5 rounded-md bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>ACTIVE PROTOCOL</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="mt-1 font-semibold text-xs text-white truncate">
            CT-101 • Cardio-X Phase III
          </div>
          
          <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Scope:</span>
            {user?.assignedSite ? (
              <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-800/60 px-1.5 py-0.5 rounded">
                {user.assignedSite} (Metro Gen)
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.5 rounded">
                Trial-Wide (5 Sites)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Navigation</span>
          <span className="text-[10px] font-mono text-slate-500">{visibleNavItems.length} Sections</span>
        </div>
        
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const badge = item.badgeKey ? getBadgeValue(item.badgeKey) : null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                const isItemActive = isActive || (item.path === "/dashboard" && location.pathname === "/");
                return `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isItemActive
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                }`;
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 opacity-90" />
                <span>{item.name}</span>
              </div>
              {badge && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                    item.badgeAlert
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status & Role Tag */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-medium">Compliance Engine</span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 border border-emerald-800/40 px-1 rounded">
            DETERMINISTIC
          </span>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400 leading-relaxed">
          ICH GCP E6(R2) & 21 CFR 312 continuous verification copilot.
        </p>
      </div>
    </aside>
  );
}
