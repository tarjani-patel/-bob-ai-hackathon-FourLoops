import React, { useState, useEffect, useMemo } from "react";
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
  Play, 
  Lock 
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { CapaDetailDrawer } from "../components/CapaDetailDrawer.jsx";
import { RoleBadge } from "../auth/RoleBadge.jsx";
import { getVisibleCapas } from "../auth/dataScoping.js";

export function CapaPage() {
  const { capas, updateCapaStatus, hasAnalyzed, runComplianceAnalysis, isAnalyzing } = useTrial();
  const { user, isInvestigator, isSponsor } = useAuth();
  const location = useLocation();

  const [selectedCapa, setSelectedCapa] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Scoped CAPAs
  const scopedCapas = useMemo(() => {
    return getVisibleCapas(user, capas);
  }, [user, capas]);

  const activeCapa = useMemo(() => {
    if (!selectedCapa) return null;
    return scopedCapas.find((c) => c.id === selectedCapa.id) || selectedCapa;
  }, [selectedCapa, scopedCapas]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const siteParam = params.get("site");
    const selectParam = params.get("select");
    if (siteParam) {
      setSearchQuery(siteParam);
    }
    if (selectParam) {
      const match = scopedCapas.find((c) => c.id === selectParam);
      if (match) setSelectedCapa(match);
    }
  }, [location.search, scopedCapas]);

  const filteredCapas = scopedCapas.filter((c) => {
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
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="prohealth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isInvestigator ? "Site 03 Corrective & Preventive Actions (CAPA)" : "CAPA Oversight & Preventive Actions"}
            </h1>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-xs">
              {scopedCapas.length} Active Plans
            </span>
            <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {isInvestigator
              ? "Autonomous action plans generated for Metro General scheduling and compliance anomalies. Principal Investigator response requested."
              : "Autonomous Corrective and Preventive Action plans generated directly from deviation clusters and site risk anomalies."}
          </p>
        </div>

        <button
          onClick={() => alert(`Comprehensive CAPA Audit Dossier (${scopedCapas.length} plans) exported.`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 text-xs font-bold shadow-xs transition-all"
        >
          <FileDown className="w-4 h-4 text-blue-600" />
          <span>Export CAPA Dossier</span>
        </button>
      </div>

      {/* Human Review Required Alert Banner */}
      <div className="prohealth-card rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Mandatory Sponsor / PI Authorization Required
            </h2>
            <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
              TrialGuard AI proposes root causes and corrective steps from deterministic facts. In accordance with FDA 21 CFR 312 and GCP guidelines, final approval requires Sponsor / Study Manager authorization.
            </p>
          </div>
        </div>
      </div>

      {/* If unanalyzed state */}
      {!hasAnalyzed && scopedCapas.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No CAPAs Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Autonomous CAPAs are formulated dynamically when the compliance engine detects severe deviation clusters and high-risk site anomalies.
          </p>
          {user?.permissions?.includes("RUN_COMPLIANCE_ANALYSIS") && (
            <button
              onClick={() => runComplianceAnalysis(user)}
              disabled={isAnalyzing}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Compliance Analysis to Generate CAPAs</span>
            </button>
          )}
        </div>
      )}

      {/* CAPA Cards List */}
      <div className="space-y-3">
        {filteredCapas.map((capa) => {
          const isApproved = capa.status === "Approved";
          const isPending = capa.status === "Draft" || capa.status === "Under Review" || capa.status === "Open";

          return (
            <div
              key={capa.id}
              onClick={() => setSelectedCapa(capa)}
              className="prohealth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-100 p-6 shadow-sm hover:shadow-float hover:border-blue-300 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {capa.id}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      isApproved
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {capa.status}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      capa.priority === "High"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {capa.priority}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {capa.siteName}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                  {capa.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                  {capa.problemStatement}
                </p>

                <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span>Assigned: <strong className="text-slate-700">{capa.owner}</strong></span>
                  <span>Category: <strong className="text-slate-700">{capa.category}</strong></span>
                  <span>Deviations: <strong className="text-blue-700 font-mono">{capa.linkedDeviationsCount}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Approved by Sponsor</span>
                  </span>
                ) : isSponsor ? (
                  <span className="inline-flex items-center gap-1 text-amber-800 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Requires Sponsor Sign-off</span>
                  </span>
                ) : isInvestigator ? (
                  <span className="inline-flex items-center gap-1 text-purple-800 font-bold text-xs bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                    <span>Investigator Response Required</span>
                  </span>
                ) : null}

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      <CapaDetailDrawer
        capa={activeCapa}
        onClose={() => setSelectedCapa(null)}
        onUpdateStatus={updateCapaStatus}
      />
    </div>
  );
}
