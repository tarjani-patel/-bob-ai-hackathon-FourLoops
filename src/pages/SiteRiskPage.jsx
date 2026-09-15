import React, { useState, useEffect } from "react";
import { 
  Building2, 
  TrendingUp, 
  ShieldAlert, 
  Users, 
  AlertTriangle, 
  Sparkles, 
  FileCheck, 
  ChevronRight, 
  ArrowUpRight,
  Stethoscope,
  Search,
  Filter
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";
import { RiskBadge, SeverityBadge, TrendBadge } from "../components/RiskBadge.jsx";
import { SiteDetailDrawer } from "../components/SiteDetailDrawer.jsx";
import { DeviationDetailDrawer } from "../components/DeviationDetailDrawer.jsx";

export function SiteRiskPage() {
  const { siteRisks, deviations } = useTrial();
  const location = useLocation();

  // NO site selected by default -> NO modal open initially!
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [filterBand, setFilterBand] = useState("All");

  // Support deep-linking via query parameter if explicitly supplied by user/search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectParam = params.get("select");
    if (selectParam) {
      const match = siteRisks.find((s) => s.siteId === selectParam || s.siteCode === selectParam);
      if (match) setSelectedSiteId(match.siteId);
    }
  }, [location.search, siteRisks]);

  const filteredSites = siteRisks.filter((s) => {
    if (filterBand !== "All" && s.riskBand !== filterBand) return false;
    return true;
  });

  const selectedSite = selectedSiteId ? siteRisks.find((s) => s.siteId === selectedSiteId) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Site Risk & Monitoring Index</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              5 Active Investigation Centers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Deterministic risk engine continuously ranks trial investigation sites from patient deviation density and severity. Click any site to inspect its detailed risk drivers, predicted trajectory, and recommended monitoring actions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Filter:</span>
          <select
            value={filterBand}
            onChange={(e) => setFilterBand(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:bg-white"
          >
            <option value="All">All Risk Bands ({siteRisks.length})</option>
            <option value="High">High Risk (61–100)</option>
            <option value="Medium">Medium Risk (31–60)</option>
            <option value="Low">Low Risk (0–30)</option>
          </select>
        </div>
      </div>

      {/* Sites Grid: Display all 5 sites clearly with cards & metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSites.map((site, index) => {
          const isHigh = site.riskBand === "High";
          const isMedium = site.riskBand === "Medium";

          return (
            <div
              key={site.siteId}
              onClick={() => setSelectedSiteId(site.siteId)}
              className={`bg-white rounded-xl border p-5 shadow-subtle hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                isHigh 
                  ? "border-rose-300 hover:border-rose-500 ring-1 ring-rose-200/60" 
                  : isMedium
                  ? "border-amber-200 hover:border-amber-400"
                  : "border-slate-200 hover:border-blue-400"
              }`}
            >
              <div>
                {/* Card Top: Rank & Badges */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
                      #{index + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      {site.siteCode}
                    </span>
                    <RiskBadge band={site.riskBand} score={site.score} size="sm" />
                  </div>

                  <TrendBadge trend={site.trend} projectedChange={site.projectedChange} />
                </div>

                {/* Site Title */}
                <h2 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {site.siteName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {site.location} • PI: <span className="font-medium text-slate-700">{site.pi}</span>
                </p>

                {/* Score & Predicted Forecast */}
                <div className="mt-4 grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Risk</span>
                    <div className={`text-xl font-bold font-mono ${isHigh ? "text-rose-700" : isMedium ? "text-amber-700" : "text-emerald-700"}`}>
                      {site.score}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600">30-Day Predicted</span>
                    <div className="text-xl font-bold font-mono text-blue-900">
                      {site.predictedScore}<span className="text-xs text-blue-400 font-normal">/100</span>
                    </div>
                  </div>
                </div>

                {/* Cohort & Deviation Breakdown */}
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Deviations Recorded:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {site.deviationCount} ({site.criticalCount} Critical, {site.majorCount} Major)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Cohort Contamination:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {site.affectedPatientCount} of {site.patientCount} subjects ({((site.affectedPatientCount / (site.patientCount || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>

                {/* Key Driver Badge */}
                {site.riskDrivers && site.riskDrivers.length > 0 && (
                  <div className="mt-3 p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 truncate">
                    <strong className="text-slate-700">Driver:</strong> {site.riskDrivers[0]}
                  </div>
                )}
              </div>

              {/* Action Link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">CRA: {site.cra}</span>
                <span className="font-semibold text-blue-700 group-hover:text-blue-900 flex items-center gap-0.5">
                  Analyze Site Risk →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full 5-Site Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Comparative Site Risk Matrix</h2>
            <p className="text-xs text-slate-500">Cross-center metrics calculated by deterministic risk engine</p>
          </div>
          <span className="text-xs text-slate-400">Click any row to open deep dive</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Site Code</th>
                <th className="py-3 px-4">Investigation Center</th>
                <th className="py-3 px-4">Location & PI</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Band</th>
                <th className="py-3 px-4">30-Day Trend</th>
                <th className="py-3 px-4">Deviations</th>
                <th className="py-3 px-4">Cohort Impact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siteRisks.map((site, idx) => (
                <tr
                  key={site.siteId}
                  onClick={() => setSelectedSiteId(site.siteId)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {site.siteCode}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {site.siteName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {site.location} • <span className="text-slate-500">{site.pi}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {site.score}/100
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge band={site.riskBand} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <TrendBadge trend={site.trend} projectedChange={site.projectedChange} />
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {site.deviationCount} <span className="text-[10px] text-slate-400">({site.criticalCount} crit)</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {site.affectedPatientCount}/{site.patientCount} ({((site.affectedPatientCount / (site.patientCount || 1)) * 100).toFixed(0)}%)
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSiteId(site.siteId);
                      }}
                      className="text-xs font-semibold text-blue-700 group-hover:text-blue-900 bg-white border border-slate-200 group-hover:border-blue-300 px-2.5 py-1 rounded transition-colors"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Site Detail Drawer (Only rendered when selectedSite is non-null) */}
      <SiteDetailDrawer
        site={selectedSite}
        onClose={() => setSelectedSiteId(null)}
        onSelectDeviation={(dev) => setSelectedDeviation(dev)}
      />

      {/* Linked Deviation Detail Drawer */}
      <DeviationDetailDrawer
        deviation={selectedDeviation}
        onClose={() => setSelectedDeviation(null)}
      />
    </div>
  );
}
