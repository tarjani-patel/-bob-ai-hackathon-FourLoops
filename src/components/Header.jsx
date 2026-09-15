import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { useTrial } from "../context/TrialContext.jsx";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { 
    protocol, 
    unreadNotificationCount, 
    setIsNotificationModalOpen, 
    runComplianceAnalysis, 
    isAnalyzing,
    lastAnalysisResult
  } = useTrial();

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Left: Trial Selector & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
          <FlaskConical className="w-4 h-4 text-blue-700" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Active Trial</span>
            <div 
              onClick={() => navigate("/trial-protocol")}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                {protocol.trialId}: {protocol.trialName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {lastAnalysisResult && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-emerald-50/60 border border-emerald-200/60 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified at <span className="font-mono text-slate-700">{lastAnalysisResult.timestamp}</span></span>
          </div>
        )}
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient (PT-1042), site (SITE-03), deviation (DEV-2026-001)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
          />
        </form>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-3">
        {/* Run Compliance Analysis Button */}
        <button
          onClick={runComplianceAnalysis}
          disabled={isAnalyzing}
          className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            isAnalyzing
              ? "bg-blue-800 text-white cursor-wait"
              : "bg-blue-700 hover:bg-blue-800 text-white hover:shadow"
          }`}
          title="Executes deterministic rule verification across all enrolled trial subjects"
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

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationModalOpen(true)}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors"
          title="Open Compliance & Safety Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* User / Profile Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
            AM
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">Dr. Alex Mercer</div>
            <div className="text-[10px] text-slate-400 font-medium">Lead Compliance Auditor (CRA)</div>
          </div>
        </div>
      </div>
    </header>
  );
}
