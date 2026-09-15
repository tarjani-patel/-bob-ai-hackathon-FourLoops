import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  Plus, 
  FileDown, 
  Search, 
  Filter, 
  ChevronRight,
  Sparkles,
  Play
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";
import { CapaDetailDrawer } from "../components/CapaDetailDrawer.jsx";

export function CapaPage() {
  const { capas, updateCapaStatus, hasAnalyzed, runComplianceAnalysis, isAnalyzing } = useTrial();
  const location = useLocation();

  const [selectedCapa, setSelectedCapa] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const siteParam = params.get("site");
    const selectParam = params.get("select");
    if (siteParam) {
      setSearchQuery(siteParam);
    }
    if (selectParam) {
      const match = capas.find((c) => c.id === selectParam);
      if (match) setSelectedCapa(match);
    }
  }, [location.search, capas]);

  const filteredCapas = capas.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = c.id.toLowerCase().includes(q);
      const matchesTitle = c.title.toLowerCase().includes(q);
      const matchesSite = c.siteName.toLowerCase().includes(q) || (c.siteId && c.siteId.toLowerCase().includes(q));
      if (!matchesId && !matchesTitle && !matchesSite) return false;
    }
    if (priorityFilter !== "All" && c.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              CAPA Oversight & Preventive Actions
            </h1>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {capas.length} Active Plans
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Autonomous Corrective and Preventive Action plans generated directly from deviation clusters and site risk anomalies. Every action plan mandates qualified clinical auditor sign-off.
          </p>
        </div>

        <button
          onClick={() => alert("Comprehensive CAPA Audit Dossier exported for IRB & Sponsor review.")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
        >
          <FileDown className="w-4 h-4" />
          <span>Export CAPA Dossier</span>
        </button>
      </div>

      {/* Human Review Required Alert Banner */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Mandatory Human Review Required
            </h2>
            <p className="text-xs text-amber-800 mt-0.5">
              TrialGuard AI proposes root causes and corrective steps from deterministic facts. In accordance with FDA 21 CFR 312 and GCP guidelines, automated recommendations require Principal Investigator / Lead CRA approval prior to formal execution.
            </p>
          </div>
        </div>
      </div>

      {/* If unanalyzed state */}
      {!hasAnalyzed && capas.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Awaiting Cohort Compliance Scan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Run the compliance analysis from the Dashboard or click below to analyze deviation clusters and generate targeted CAPA plans.
          </p>
          <button
            onClick={runComplianceAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Compliance Analysis Now</span>
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      {capas.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CAPA ID, problem, or site (e.g. SITE-03)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-blue-700 hover:text-blue-900 font-semibold px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* CAPA Cards */}
      {capas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCapas.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCapa(c)}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-5 shadow-subtle hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      c.priority === "Critical"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {c.priority} Priority
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                    c.status === "Approved"
                      ? "text-emerald-800 bg-emerald-50 border-emerald-300"
                      : "text-amber-700 bg-amber-50 border-amber-200"
                  }`}>
                    {c.status === "Approved" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3" />
                        Review Required
                      </>
                    )}
                  </span>
                </div>

                <h2 className="mt-2.5 text-sm font-bold text-slate-900 leading-snug">
                  {c.title}
                </h2>

                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.problemStatement}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Targeted Preventative Action
                  </div>
                  <div className="mt-1 text-slate-700 line-clamp-2 font-medium">
                    {c.preventiveAction.split("\n")[0]}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span>Site: </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[140px] inline-block align-bottom">
                    {c.siteName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-700">Due: {c.dueDate}</span>
                  <span className="font-semibold text-blue-700 flex items-center gap-0.5">
                    Inspect →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CAPA Detail Drawer */}
      <CapaDetailDrawer
        capa={selectedCapa}
        onClose={() => setSelectedCapa(null)}
        onUpdateStatus={(capaId, newStatus) => {
          updateCapaStatus(capaId, newStatus);
          setSelectedCapa((prev) => (prev ? { ...prev, status: newStatus } : null));
        }}
      />
    </div>
  );
}
