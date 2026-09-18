import React, { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  XCircle, 
  Clock, 
  Download, 
  Database, 
  Lock, 
  ShieldAlert 
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { RiskBadge, SeverityBadge } from "../components/RiskBadge.jsx";
import { RoleBadge } from "../auth/RoleBadge.jsx";
import { PatientDetailDrawer } from "../components/PatientDetailDrawer.jsx";
import { DeviationDetailDrawer } from "../components/DeviationDetailDrawer.jsx";
import { getVisiblePatients } from "../auth/dataScoping.js";
import { AccessRestricted } from "../auth/AccessRestricted.jsx";

export function PatientsPage() {
  const { patients, patientProfiles, deviations } = useTrial();
  const { user, isInvestigator, isDataManager } = useAuth();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [siteFilter, setSiteFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [dataIssuesOnly, setDataIssuesOnly] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedDeviation, setSelectedDeviation] = useState(null);

  // Scoped patients array based on active role
  const scopedPatients = useMemo(() => {
    return getVisiblePatients(user, patients);
  }, [user, patients]);

  // Check URL query parameters for deep-linking
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectParam = params.get("select");
    const searchParam = params.get("search");

    if (selectParam) {
      setSelectedPatientId(selectParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Combine patient record with profile
  const enrichedPatients = useMemo(() => {
    return scopedPatients.map((pt) => {
      const prof = patientProfiles.find((p) => p.patientId === pt.id) || {
        totalRiskScore: 0,
        riskBand: "Low",
        compliancePercentage: 100,
        deviationCount: 0
      };

      const hasMissingCbc = !pt.labs.some((l) => l.labName.includes("CBC"));
      const nonStandardMed = pt.medications.find((m) => m.drugName === "Cardio-X" && m.doseMg !== 100);
      const hasMissingV2Vitals = pt.visits.some((v) => v.visitNumber === 2 && !v.vitals);
      const hasDataIssue = hasMissingCbc || Boolean(nonStandardMed) || hasMissingV2Vitals;

      return {
        ...pt,
        profile: prof,
        hasDataIssue
      };
    });
  }, [scopedPatients, patientProfiles]);

  // Filtered list
  const filteredPatients = useMemo(() => {
    return enrichedPatients.filter((pt) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = pt.id.toLowerCase().includes(q);
        const matchesSite = pt.siteName.toLowerCase().includes(q) || pt.siteId.toLowerCase().includes(q);
        if (!matchesId && !matchesSite) return false;
      }

      // Site filter (only active if not investigator)
      if (!isInvestigator && siteFilter !== "All" && pt.siteId !== siteFilter) {
        return false;
      }

      // Risk filter
      if (riskFilter !== "All" && pt.profile.riskBand !== riskFilter) {
        return false;
      }

      // Data Manager Data Issue filter
      if (dataIssuesOnly && !pt.hasDataIssue) {
        return false;
      }

      return true;
    });
  }, [enrichedPatients, searchQuery, siteFilter, riskFilter, dataIssuesOnly, isInvestigator]);

  // Check if selected patient violates investigator scoping
  const selectedPatientObj = patients.find((p) => p.id === selectedPatientId);
  const isSelectedPatientForbidden = 
    isInvestigator && selectedPatientObj && selectedPatientObj.siteId !== user.assignedSite;

  const selectedProfile = patientProfiles.find((p) => p.patientId === selectedPatientId);

  // If investigator attempted to access a patient from another site via URL
  if (isSelectedPatientForbidden) {
    return (
      <AccessRestricted
        restrictedSiteId={selectedPatientObj.siteId}
        customMessage="You only have access to your assigned clinical site."
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="prohealth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isInvestigator ? "Site 03 Participant Cohort" : "Participant Cohort Directory"}
            </h1>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-xs">
              {scopedPatients.length} Enrolled {isInvestigator ? "(Metro Gen)" : "(5 Sites)"}
            </span>
            <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isInvestigator
              ? "Confidential patient safety and visit adherence records for Metro General Health Science Center."
              : "Real-time participant adherence records across trial sites. Click any row to inspect visit history."}
          </p>
        </div>

        {/* Data Manager filter toggle or Export */}
        <div className="flex items-center gap-2.5">
          {isDataManager && (
            <button
              onClick={() => setDataIssuesOnly(!dataIssuesOnly)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                dataIssuesOnly
                  ? "bg-teal-700 text-white shadow-glow"
                  : "bg-teal-50 border border-teal-300 text-teal-800 hover:bg-teal-100"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{dataIssuesOnly ? "Showing eCRF Queries" : "Filter: eCRF Queries Pending"}</span>
            </button>
          )}

          <button
            onClick={() => alert(`Participant Export: ${scopedPatients.length} records compiled for GCP monitoring.`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 text-xs font-bold shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Roster</span>
          </button>
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
            placeholder={isInvestigator ? "Search Site 03 participant (PT-1042)..." : "Search participant ID (PT-1042), site name..."}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Site Filter: Disabled / Hidden for Investigator */}
          {!isInvestigator ? (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Site:</span>
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
              >
                <option value="All">All Sites (5)</option>
                <option value="SITE-01">Site 01 (Mayo Clinic)</option>
                <option value="SITE-02">Site 02 (Johns Hopkins)</option>
                <option value="SITE-03">Site 03 (Metro General)</option>
                <option value="SITE-04">Site 04 (UCSF Medical)</option>
                <option value="SITE-05">Site 05 (MD Anderson)</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 text-[11px] font-bold">
              <Lock className="w-3 h-3 text-purple-600" />
              <span>Site: Metro General (SITE-03 Only)</span>
            </div>
          )}

          {/* Risk Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Risk Bands</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Participant Roster Table */}
      <div className="prohealth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-100 shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Subject ID</th>
                <th className="py-3 px-4">Site Location</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Enrolled</th>
                <th className="py-3 px-4">Visit Progress</th>
                <th className="py-3 px-4">Compliance %</th>
                <th className="py-3 px-4">Risk Band</th>
                <th className="py-3 px-4">Deviations</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No participants match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pt) => {
                  const completedVisits = pt.visits.filter((v) => v.status === "Completed").length;
                  const totalVisits = pt.visits.length;
                  const isHighRisk = pt.profile.riskBand === "High";

                  return (
                    <tr
                      key={pt.id}
                      onClick={() => setSelectedPatientId(pt.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isHighRisk ? "bg-rose-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{pt.id}</span>
                        {pt.hasDataIssue && isDataManager && (
                          <span className="w-2 h-2 rounded-full bg-teal-500" title="eCRF query pending resolution" />
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{pt.siteName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{pt.siteId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {pt.age}y • {pt.gender}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {pt.enrollmentDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {completedVisits}/{totalVisits}
                          </span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${(completedVisits / totalVisits) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800">
                          {pt.profile.compliancePercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge band={pt.profile.riskBand} score={pt.profile.totalRiskScore} />
                      </td>
                      <td className="py-3.5 px-4">
                        {pt.profile.deviationCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{pt.profile.deviationCount}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>0</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatientId(pt.id);
                          }}
                          className="text-blue-600 hover:text-white hover:bg-blue-600 font-bold inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 shadow-xs transition-all cursor-pointer hover:scale-105"
                        >
                          <span>{isDataManager && pt.hasDataIssue ? "Edit eCRF" : "View"}</span>
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
          <span>Showing {filteredPatients.length} of {scopedPatients.length} scoped participants</span>
          <span className="font-mono font-semibold">
            {isInvestigator ? "Scoped to SITE-03" : "Multi-Site Registry"}
          </span>
        </div>
      </div>

      {/* Drawers */}
      {selectedPatientId && selectedPatientObj && (
        <PatientDetailDrawer
          patient={selectedPatientObj}
          patientProfile={selectedProfile}
          deviations={deviations}
          onClose={() => setSelectedPatientId(null)}
          onSelectDeviation={(d) => {
            setSelectedPatientId(null);
            setSelectedDeviation(d);
          }}
        />
      )}

      {selectedDeviation && (
        <DeviationDetailDrawer
          deviation={selectedDeviation}
          onClose={() => setSelectedDeviation(null)}
          onSelectPatient={(id) => {
            setSelectedDeviation(null);
            setSelectedPatientId(id);
          }}
        />
      )}
    </div>
  );
}
