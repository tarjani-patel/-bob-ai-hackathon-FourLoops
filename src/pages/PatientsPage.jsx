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
  Download
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";
import { RiskBadge, SeverityBadge } from "../components/RiskBadge.jsx";
import { PatientDetailDrawer } from "../components/PatientDetailDrawer.jsx";
import { DeviationDetailDrawer } from "../components/DeviationDetailDrawer.jsx";

export function PatientsPage() {
  const { patients, patientProfiles, deviations } = useTrial();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [siteFilter, setSiteFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedDeviation, setSelectedDeviation] = useState(null);

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
    return patients.map((pt) => {
      const prof = patientProfiles.find((p) => p.patientId === pt.id) || {
        totalRiskScore: 0,
        riskBand: "Low",
        compliancePercentage: 100,
        deviationCount: 0
      };
      return {
        ...pt,
        profile: prof
      };
    });
  }, [patients, patientProfiles]);

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

      // Site filter
      if (siteFilter !== "All" && pt.siteId !== siteFilter) {
        return false;
      }

      // Risk filter
      if (riskFilter !== "All" && pt.profile.riskBand !== riskFilter) {
        return false;
      }

      return true;
    });
  }, [enrichedPatients, searchQuery, siteFilter, riskFilter]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedProfile = patientProfiles.find((p) => p.patientId === selectedPatientId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Participant Cohort Directory</h1>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {patients.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time participant adherence records across all 5 study sites. Click any row to view full visit history.
          </p>
        </div>

        <button
          onClick={() => alert("Exported Subject Compliance Register in CSV format.")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
        >
          <Download className="w-4 h-4" />
          <span>Export Cohort CSV</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient ID (e.g. PT-1042)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:bg-white"
          >
            <option value="All">All Sites (5)</option>
            <option value="SITE-01">Site 01 (Mayo Clinic)</option>
            <option value="SITE-02">Site 02 (Johns Hopkins)</option>
            <option value="SITE-03">Site 03 (Metro General)</option>
            <option value="SITE-04">Site 04 (Stanford)</option>
            <option value="SITE-05">Site 05 (Boston)</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:bg-white"
          >
            <option value="All">All Risk Bands</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {(searchQuery || siteFilter !== "All" || riskFilter !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSiteFilter("All");
                setRiskFilter("All");
              }}
              className="text-blue-700 hover:text-blue-900 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Patient Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Clinical Site</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Last Completed Visit</th>
                <th className="py-3 px-4">Deviations</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No participants found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pt) => {
                  const lastVisit = [...pt.visits].reverse().find((v) => v.status === "Completed") || pt.visits[0];

                  return (
                    <tr
                      key={pt.id}
                      onClick={() => setSelectedPatientId(pt.id)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 group-hover:text-blue-700">
                        {pt.id}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {pt.siteName}
                        <span className="ml-1 text-[10px] text-slate-400 font-mono">({pt.siteId})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {pt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700">
                            {pt.profile.compliancePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge band={pt.profile.riskBand} score={pt.profile.totalRiskScore} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Visit {lastVisit.visitNumber} ({lastVisit.date || "Scheduled"})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {pt.profile.deviationCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            {pt.profile.deviationCount} event{pt.profile.deviationCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-blue-700 group-hover:text-blue-900">
                          Timeline →
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredPatients.length} of {patients.length} participants</span>
          <span>Click any subject to open visit compliance timeline & clinical details</span>
        </div>
      </div>

      {/* Patient Detail Drawer */}
      <PatientDetailDrawer
        patient={selectedPatient}
        patientProfile={selectedProfile}
        deviations={deviations}
        onClose={() => setSelectedPatientId(null)}
        onSelectDeviation={(dev) => {
          setSelectedDeviation(dev);
        }}
      />

      {/* Linked Deviation Detail Drawer */}
      <DeviationDetailDrawer
        deviation={selectedDeviation}
        onClose={() => setSelectedDeviation(null)}
      />
    </div>
  );
}
