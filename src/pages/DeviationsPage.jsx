import React, { useState, useMemo, useEffect } from "react";
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  ShieldAlert, 
  Download, 
  ChevronRight, 
  FileCheck, 
  CheckCircle2, 
  ExternalLink,
  Lock
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { SeverityBadge } from "../components/RiskBadge.jsx";
import { RoleBadge } from "../auth/RoleBadge.jsx";
import { DeviationDetailDrawer } from "../components/DeviationDetailDrawer.jsx";
import { PatientDetailDrawer } from "../components/PatientDetailDrawer.jsx";
import { getVisibleDeviations } from "../auth/dataScoping.js";
import { AccessRestricted } from "../auth/AccessRestricted.jsx";

export function DeviationsPage() {
  const { deviations, patients, patientProfiles } = useTrial();
  const { user, isInvestigator } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [siteFilter, setSiteFilter] = useState("All");
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Scoped deviations
  const scopedDeviations = useMemo(() => {
    return getVisibleDeviations(user, deviations);
  }, [user, deviations]);

  // Check URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectId = params.get("select");
    const searchParam = params.get("search");

    if (selectId) {
      const match = deviations.find((d) => d.id === selectId);
      if (match) setSelectedDeviation(match);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search, deviations]);

  // Guard against investigator viewing other site deviations via deep-link
  const isSelectedDevForbidden = 
    isInvestigator && selectedDeviation && selectedDeviation.siteId !== user.assignedSite;

  if (isSelectedDevForbidden) {
    return (
      <AccessRestricted
        restrictedSiteId={selectedDeviation.siteId}
        customMessage="You only have access to your assigned clinical site."
      />
    );
  }

  // Categories list
  const categories = useMemo(() => {
    return ["All", ...new Set(scopedDeviations.map((d) => d.category))];
  }, [scopedDeviations]);

  // Filtered deviations
  const filteredDeviations = useMemo(() => {
    return scopedDeviations.filter((dev) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = dev.id.toLowerCase().includes(q);
        const matchesPt = dev.patientId.toLowerCase().includes(q);
        const matchesSite = dev.siteName.toLowerCase().includes(q) || dev.siteId.toLowerCase().includes(q);
        const matchesActual = dev.actual.toLowerCase().includes(q);
        if (!matchesId && !matchesPt && !matchesSite && !matchesActual) return false;
      }

      // Severity filter
      if (severityFilter !== "All" && dev.severity !== severityFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "All" && dev.category !== categoryFilter) {
        return false;
      }

      // Site filter
      if (!isInvestigator && siteFilter !== "All" && dev.siteId !== siteFilter) {
        return false;
      }

      return true;
    });
  }, [scopedDeviations, searchQuery, severityFilter, categoryFilter, siteFilter, isInvestigator]);

  const criticalCount = scopedDeviations.filter((d) => d.severity === "Critical").length;
  const majorCount = scopedDeviations.filter((d) => d.severity === "Major").length;
  const minorCount = scopedDeviations.filter((d) => d.severity === "Minor").length;
  const adminCount = scopedDeviations.filter((d) => d.severity === "Administrative").length;

  const selectedPatientObj = patients.find((p) => p.id === selectedPatientId);
  const selectedPatientProf = patientProfiles.find((p) => p.patientId === selectedPatientId);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="prohealth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isInvestigator ? "Site 03 Protocol Deviations Register" : "Protocol Deviations Register"}
            </h1>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-xs">
              {scopedDeviations.length} Active Records
            </span>
            <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {isInvestigator
              ? "Confidential deviation log for Metro General Health Science Center. Every item includes rule violation citation, root cause explanation, and regulatory impact."
              : "Deterministic protocol deviations evaluated against Protocol v3.2. Every item includes rule violation citation, root cause explanation, and regulatory impact."}
          </p>
        </div>

        <button
          onClick={() => alert(`Deviations Register (${scopedDeviations.length} items) exported for regulatory submission.`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 text-xs font-bold shadow-xs transition-all"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export Register</span>
        </button>
      </div>

      {/* Severity Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div 
          onClick={() => setSeverityFilter(severityFilter === "Critical" ? "All" : "Critical")}
          className={`prohealth-card p-4 rounded-2xl border transition-all cursor-pointer ${
            severityFilter === "Critical" 
              ? "bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/30 shadow-xs" 
              : "bg-white/90 border-slate-200 hover:border-rose-300 hover:shadow-float"
          }`}
        >
          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Critical Violations</div>
          <div className="text-2xl font-extrabold font-mono text-rose-700 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Immediate safety risk / GCP breach</div>
        </div>

        <div 
          onClick={() => setSeverityFilter(severityFilter === "Major" ? "All" : "Major")}
          className={`prohealth-card p-4 rounded-2xl border transition-all cursor-pointer ${
            severityFilter === "Major" 
              ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/30 shadow-xs" 
              : "bg-white/90 border-slate-200 hover:border-amber-300 hover:shadow-float"
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Major Deviations</div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 mt-1">{majorCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Window / dosing non-adherence</div>
        </div>

        <div 
          onClick={() => setSeverityFilter(severityFilter === "Minor" ? "All" : "Minor")}
          className={`prohealth-card p-4 rounded-2xl border transition-all cursor-pointer ${
            severityFilter === "Minor" 
              ? "bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/30 shadow-xs" 
              : "bg-white/90 border-slate-200 hover:border-blue-300 hover:shadow-float"
          }`}
        >
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Minor Non-Adherence</div>
          <div className="text-2xl font-extrabold font-mono text-blue-700 mt-1">{minorCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Timing variances &lt; 2 days</div>
        </div>

        <div 
          onClick={() => setSeverityFilter(severityFilter === "Administrative" ? "All" : "Administrative")}
          className={`prohealth-card p-4 rounded-2xl border transition-all cursor-pointer ${
            severityFilter === "Administrative" 
              ? "bg-slate-100 border-slate-400 ring-2 ring-slate-400/30 shadow-xs" 
              : "bg-white/90 border-slate-200 hover:border-slate-300 hover:shadow-float"
          }`}
        >
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Administrative</div>
          <div className="text-2xl font-extrabold font-mono text-slate-700 mt-1">{adminCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Documentation / filing issues</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="prohealth-card bg-white/95 backdrop-blur-xl rounded-2xl border border-blue-100 p-4 shadow-glass flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deviation (DEV-2026-001), participant (PT-1043)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>

          {/* Site Filter: Disabled for Investigator */}
          {!isInvestigator ? (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Site:</span>
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
              >
                <option value="All">All Sites (5)</option>
                <option value="SITE-01">Site 01 (Mayo)</option>
                <option value="SITE-02">Site 02 (Johns Hopkins)</option>
                <option value="SITE-03">Site 03 (Metro Gen)</option>
                <option value="SITE-04">Site 04 (UCSF)</option>
                <option value="SITE-05">Site 05 (MD Anderson)</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 text-[11px] font-bold">
              <Lock className="w-3 h-3 text-purple-600" />
              <span>SITE-03 Scoped</span>
            </div>
          )}
        </div>
      </div>

      {/* Deviations Table */}
      <div className="prohealth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-100 shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Deviation ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Site Location</th>
                <th className="py-3 px-4">Protocol Rule Violated</th>
                <th className="py-3 px-4">Detected Observation</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeviations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No protocol deviations match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDeviations.map((dev) => {
                  const isCritical = dev.severity === "Critical";
                  const isMajor = dev.severity === "Major";

                  return (
                    <tr
                      key={dev.id}
                      onClick={() => setSelectedDeviation(dev)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isCritical ? "bg-rose-50/40" : isMajor ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {dev.id}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SeverityBadge severity={dev.severity} showWeight={true} />
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {dev.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 whitespace-nowrap">
                        {dev.patientId}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{dev.siteCode || dev.siteId}</div>
                        <div className="text-[10px] text-slate-400">{dev.siteName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-medium">
                        {dev.ruleViolated || dev.expected}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {dev.actual}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeviation(dev);
                          }}
                          className="text-blue-600 hover:text-white hover:bg-blue-600 font-bold inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 shadow-xs transition-all cursor-pointer hover:scale-105"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredDeviations.length} of {scopedDeviations.length} scoped deviations</span>
          <span className="font-mono font-semibold">
            {isInvestigator ? "Scoped to SITE-03" : "Deterministic Engine Output"}
          </span>
        </div>
      </div>

      {/* Drawers */}
      {selectedDeviation && (
        <DeviationDetailDrawer
          deviation={selectedDeviation}
          onClose={() => setSelectedDeviation(null)}
          onSelectPatient={(patientId) => {
            setSelectedDeviation(null);
            setSelectedPatientId(patientId);
          }}
        />
      )}

      {selectedPatientId && selectedPatientObj && (
        <PatientDetailDrawer
          patient={selectedPatientObj}
          patientProfile={selectedPatientProf}
          deviations={deviations}
          onClose={() => setSelectedPatientId(null)}
          onSelectDeviation={(dev) => {
            setSelectedPatientId(null);
            setSelectedDeviation(dev);
          }}
        />
      )}
    </div>
  );
}
