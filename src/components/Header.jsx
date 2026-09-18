import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Search, 
  Play, 
  RotateCw, 
  CheckCircle2, 
  ChevronDown, 
  FlaskConical, 
  User, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  UserPlus, 
  ExternalLink,
  ShieldAlert,
  Globe
} from "lucide-react";
import { useTrial } from "../context/TrialContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { PERMISSIONS } from "../auth/permissions.js";
import { RoleBadge } from "../auth/RoleBadge.jsx";
import { getVisibleNotifications } from "../auth/dataScoping.js";
import { useNavigate, Link } from "react-router-dom";

export function Header() {
  const { 
    protocol, 
    notifications,
    setIsNotificationModalOpen, 
    runComplianceAnalysis, 
    isAnalyzing,
    lastAnalysisResult,
    logAuditEvent,
    apiHealthy,
    isApiLoading,
    refreshData
  } = useTrial();

  const { 
    user, 
    logout, 
    can 
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Scoped notifications for badge count
  const visibleNotifications = getVisibleNotifications(user, notifications);
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const canRunAnalysis = can(PERMISSIONS.RUN_COMPLIANCE_ANALYSIS);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toUpperCase();
    if (query.startsWith("PT-")) {
      navigate(`/patients?search=${encodeURIComponent(query)}`);
    } else if (query.startsWith("SITE-") || query.includes("SITE")) {
      navigate(`/sites?search=${encodeURIComponent(query)}`);
    } else if (query.startsWith("DEV-")) {
      navigate(`/deviations?search=${encodeURIComponent(query)}`);
    } else if (query.startsWith("CAPA-")) {
      navigate(`/capa?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/deviations?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    if (logAuditEvent && user) {
      logAuditEvent({
        action: "USER_LOGOUT",
        entityType: "AUTHENTICATION",
        entityId: user.userId || user.id,
        details: `User ${user.name} (${user.email}) signed out.`,
        performedBy: user.name,
        role: user.role
      });
    }
    logout();
    navigate("/login");
  };

  // Extract initials from user name
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "TG";

  return (
    <header className="h-16 backdrop-blur-md bg-white/90 border-b border-blue-100/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle transition-all">
      {/* Left: Trial Selector & Verification Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-100/90 px-3 py-1.5 rounded-xl shadow-xs">
          <FlaskConical className="w-4 h-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Active Trial</span>
            <div 
              onClick={() => navigate("/trial-protocol")}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                {protocol.trialId}: {protocol.trialName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Backend API Health Status Indicator */}
        <div 
          onClick={refreshData}
          title={
            apiHealthy === true
              ? "FastAPI Backend Live (port 8000). Click to re-sync data."
              : apiHealthy === false
              ? "FastAPI Backend Offline. Operating in local preview mode. Click to retry connection."
              : "Checking FastAPI connection..."
          }
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer select-none transition-all shadow-xs ${
            apiHealthy === true
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
              : apiHealthy === false
              ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
            apiHealthy === true
              ? "bg-emerald-500 animate-pulse"
              : apiHealthy === false
              ? "bg-amber-500"
              : "bg-slate-400"
          }`} />
          <span>
            {apiHealthy === true ? "FastAPI Live" : apiHealthy === false ? "Backend Offline" : "Connecting..."}
          </span>
          {isApiLoading && <RotateCw className="w-2.5 h-2.5 animate-spin ml-0.5" />}
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient (PT-1042), site (SITE-03), deviation (DEV-2026-001)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
          />
        </form>
      </div>

      {/* Right: Role-Aware Actions & User Menu */}
      <div className="flex items-center gap-3">
        {/* Landing Page Link Shortcut */}
        <Link
          to="/landing"
          title="View Platform Overview & Line-art Architecture"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span>Overview</span>
        </Link>

        {/* Run Compliance Analysis Button or Investigator Locked State */}
        {canRunAnalysis ? (
          <button
            onClick={() => runComplianceAnalysis(user)}
            disabled={isAnalyzing}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-glow transition-all ${
              isAnalyzing
                ? "bg-blue-800 text-white cursor-wait"
                : "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 hover:shadow-float active:scale-95"
            }`}
            title="Executes deterministic rule verification across enrolled trial subjects"
          >
            {isAnalyzing ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Cohort...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Compliance Analysis</span>
              </>
            )}
          </button>
        ) : (
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100/80 text-slate-500 border border-slate-200 cursor-not-allowed"
            title="Trial-wide compliance verification can only be initiated by CRA, Data Manager, or Sponsor roles."
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Analysis Managed Centrally</span>
          </div>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationModalOpen(true)}
          className="relative p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 border border-slate-200/80 transition-all"
          title="Open Compliance & Safety Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Interactive User Avatar & Session Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-90 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userInitials}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-extrabold text-slate-800 leading-tight">
                {user?.name || "Clinical User"}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {user?.roleTitle || user?.role || "Reviewer"}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-float border border-blue-100 py-2 z-50 animate-fade-in">
              {/* Active Profile Info */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Active Account
                  </span>
                  <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
                </div>
                <div className="font-bold text-sm text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500 font-mono">{user?.email}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {user?.organization || "Clinical Research Operations"}
                </div>
                {user?.assignedSite && (
                  <div className="mt-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block border border-purple-200">
                    Assigned Site: {user.assignedSite}
                  </div>
                )}
              </div>

              {/* Account Actions */}
              <div className="p-1 border-b border-slate-100">
                <Link
                  to="/landing"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50/60 rounded-xl transition-colors font-medium"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Platform Overview</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Register Another Account</span>
                </Link>
              </div>

              {/* Logout button */}
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
