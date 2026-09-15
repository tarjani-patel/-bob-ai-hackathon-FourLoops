import React from "react";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { RoleBadge } from "./RoleBadge.jsx";

export function AccessRestricted({ 
  requiredPermission, 
  requiredRole, 
  restrictedSiteId,
  customMessage 
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] p-6 text-center animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm max-w-md w-full p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-blue-900 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="inline-flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold">
            Access Restricted
          </span>
        </div>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
          {restrictedSiteId ? "Unauthorized Site Access" : "Access Restricted"}
        </h2>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          {customMessage ? (
            customMessage
          ) : restrictedSiteId ? (
            <>You only have access to your assigned clinical site ({user?.assignedSite || "SITE-03"}). Access to data for {restrictedSiteId} is restricted under trial site segregation policies.</>
          ) : (
            <>Your clinical role ({user?.roleTitle || user?.role}) does not have permission to view this resource under study protocols.</>
          )}
        </p>

        {/* User context card */}
        {user && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-5 text-left text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Active Account
              </span>
              <RoleBadge role={user.role} assignedSite={user.assignedSite} size="sm" />
            </div>
            <div className="font-bold text-slate-900">{user.name}</div>
            <div className="text-slate-500 text-[11px] font-mono">{user.email}</div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={handleReturn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
