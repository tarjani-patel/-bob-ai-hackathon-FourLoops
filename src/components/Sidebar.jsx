import React from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
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
  Lock,
  Globe
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
    <aside className="w-64 bg-[#0c1b33] text-slate-200 flex flex-col flex-shrink-0 min-h-screen border-r border-[#162746] selection:bg-blue-600">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#162746]">
        <Link to="/landing" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">TrialGuard</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Compliance Copilot</p>
          </div>
        </Link>

        {/* Current Study & Role Scope Widget */}
        <div className="mt-4 p-3 rounded-xl bg-[#13233f] border border-[#1e345b]">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            <span>Protocol Live</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Synchronized
            </span>
          </div>
          <div className="mt-1 font-bold text-xs text-white truncate">
            CT-101 • Cardio-X Phase III
          </div>
          
          <div className="mt-2 pt-2 border-t border-[#1e345b] flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Scope:</span>
            {user?.assignedSite ? (
              <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2 py-0.5 rounded-md">
                {user.assignedSite} (Metro Gen)
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-950/80 border border-sky-800/80 px-2 py-0.5 rounded-md">
                Trial-Wide (5 Sites)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                return `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isItemActive
                    ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-glow"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`;
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 opacity-90" />
                <span>{item.name}</span>
              </div>
              {badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    item.badgeAlert
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Overview link in nav */}
        <div className="pt-3 mt-3 border-t border-[#162746]">
          <Link
            to="/landing"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-sky-300 hover:bg-white/5 transition-all"
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Platform Overview</span>
          </Link>
        </div>
      </nav>

      {/* Footer System Status & Role Tag */}
      <div className="p-4 border-t border-[#162746] bg-[#081324]">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300 font-bold text-xs">Deterministic Scan</span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded font-bold">
            0% HALLUCINATION
          </span>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400 leading-relaxed">
          ICH GCP E6(R2) & FDA 21 CFR 312 verification active.
        </p>
      </div>
    </aside>
  );
}
