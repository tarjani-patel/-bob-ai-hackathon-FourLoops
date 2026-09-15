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
  ExternalLink
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";
import { SeverityBadge } from "../components/RiskBadge.jsx";
import { DeviationDetailDrawer } from "../components/DeviationDetailDrawer.jsx";
import { PatientDetailDrawer } from "../components/PatientDetailDrawer.jsx";

export function DeviationsPage() {
  const { deviations, patients, patientProfiles } = useTrial();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [siteFilter, setSiteFilter] = useState("All");
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

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

  // Categories list
  const categories = useMemo(() => {
    return ["All", ...new Set(deviations.map((d) => d.category))];
  }, [deviations]);

  // Filtered deviations
  const filteredDeviations = useMemo(() => {
    return deviations.filter((dev) => {
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
      if (siteFilter !== "All" && dev.siteId !== siteFilter) {
        return false;
      }

      return true;
    });
  }, [deviations, searchQuery, severityFilter, categoryFilter, siteFilter]);

  const criticalCount = deviations.filter((d) => d.severity === "Critical").length;
  const majorCount = deviations.filter((d) => d.severity === "Major").length;
  const minorCount = deviations.filter((d) => d.severity === "Minor").length;
  const adminCount = deviations.filter((d) => d.severity === "Administrative").length;

  const selectedPatientObj = patients.find((p) => p.id === selectedPatientId);
  const selectedPatientProf = patientProfiles.find((p) => p.patientId === selectedPatientId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Protocol Deviations Register
            </h1>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              {deviations.length} Detected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic rule violations logged against protocol CT-101. Click any row to inspect the Protocol Requirement vs Actual Data hero panel.
          </p>
        </div>

        <button
          onClick={() => alert("Protocol Deviation Audit Log exported in CSV format (ICH GCP Section 4.5.3).")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
        >
          <Download className="w-4 h-4" />
          <span>Export Deviation Log</span>
        </button>
      </div>

      {/* Severity Quick-Filter Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSeverityFilter(severityFilter === "Critical" ? "All" : "Critical")}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            severityFilter === "Critical"
              ? "bg-rose-100 border-rose-400 ring-2 ring-rose-300"
              : "bg-white border-slate-200 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-rose-800">Critical</span>
            <span className="text-[10px] font-mono text-rose-600 font-semibold">+15 pts each</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-950">{criticalCount}</div>
          <span className="text-[10px] text-rose-700">Immediate containment required</span>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === "Major" ? "All" : "Major")}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            severityFilter === "Major"
              ? "bg-orange-100 border-orange-400 ring-2 ring-orange-300"
              : "bg-white border-slate-200 hover:border-orange-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-orange-800">Major</span>
            <span className="text-[10px] font-mono text-orange-600 font-semibold">+10 pts each</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-orange-950">{majorCount}</div>
          <span className="text-[10px] text-orange-700">Window & mandatory lab breaches</span>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === "Minor" ? "All" : "Minor")}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            severityFilter === "Minor"
              ? "bg-amber-100 border-amber-400 ring-2 ring-amber-300"
              : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-800">Minor</span>
            <span className="text-[10px] font-mono text-amber-600 font-semibold">+4 pts each</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-950">{minorCount}</div>
          <span className="text-[10px] text-amber-700">Early visits & procedure delay</span>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === "Administrative" ? "All" : "Administrative")}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            severityFilter === "Administrative"
              ? "bg-slate-200 border-slate-400 ring-2 ring-slate-300"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-700">Administrative</span>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">+1 pt each</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900">{adminCount}</div>
          <span className="text-[10px] text-slate-500">eCRF data entry items</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, patient (PT-1042), site, or rule..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
            ))}
          </select>

          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Sites</option>
            <option value="SITE-01">Site 01</option>
            <option value="SITE-02">Site 02</option>
            <option value="SITE-03">Site 03 (High Risk)</option>
            <option value="SITE-04">Site 04</option>
            <option value="SITE-05">Site 05</option>
          </select>

          {(searchQuery || severityFilter !== "All" || categoryFilter !== "All" || siteFilter !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSeverityFilter("All");
                setCategoryFilter("All");
                setSiteFilter("All");
              }}
              className="text-blue-700 hover:text-blue-900 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Deviations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Deviation ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Detected Date</th>
                <th className="py-3 px-4">Observed Finding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Hero Comparison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeviations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No deviations matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDeviations.map((dev) => (
                  <tr
                    key={dev.id}
                    onClick={() => setSelectedDeviation(dev)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 group-hover:underline">
                      {dev.id}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {dev.patientId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {dev.siteName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {dev.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={dev.severity} showWeight={true} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(dev.detectedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate font-medium">
                      {dev.actual}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        dev.status === "Escalated"
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : dev.status === "Open"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {dev.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDeviation(dev);
                        }}
                        className="text-xs font-bold text-blue-700 group-hover:text-blue-900 bg-white border border-slate-200 group-hover:border-blue-300 px-2.5 py-1 rounded transition-colors"
                      >
                        Req vs Actual →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredDeviations.length} of {deviations.length} deviations</span>
          <span>Click any deviation to open the Protocol Requirement vs Actual Data inspection panel</span>
        </div>
      </div>

      {/* Drawers */}
      <DeviationDetailDrawer
        deviation={selectedDeviation}
        onClose={() => setSelectedDeviation(null)}
        onSelectPatient={(pId) => setSelectedPatientId(pId)}
      />

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
    </div>
  );
}
