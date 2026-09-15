import React from "react";
import { ShieldAlert, ArrowLeft, LogOut, User } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { RoleBadge } from "../auth/RoleBadge.jsx";

export function AccessDeniedPage({ customMessage, restrictedSiteId }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleReturn = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm max-w-lg w-full p-8 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-7 h-7 text-blue-900" />
        </div>

        <div className="inline-flex items-center gap-1.5 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded font-bold">
            403 • Authorization Notice
          </span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Access Restricted
        </h1>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          {customMessage ? (
            customMessage
          ) : restrictedSiteId ? (
            <>You only have access to your assigned clinical site ({user?.assignedSite || "SITE-03"}). Cross-site monitoring is restricted under ICH GCP E6(R2) §5.18 guidelines.</>
          ) : (
            <>Your clinical role (<strong className="text-slate-800">{user?.roleTitle || user?.role || "Current Role"}</strong>) does not have authorization to view this section under trial governance protocols.</>
          )}
        </p>

        {/* User context card */}
        {user && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-6 text-left text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Authenticated Account
              </span>
              <RoleBadge role={user.role} assignedSite={user.assignedSite} size="sm" />
            </div>
            <div className="font-bold text-slate-900">{user.name}</div>
            <div className="text-slate-500 text-[11px] font-mono">{user.email}</div>
            {user.assignedSite && (
              <div className="text-[11px] text-purple-700 font-semibold mt-1">
                Assigned Site: {user.assignedSite}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReturn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign In with Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
