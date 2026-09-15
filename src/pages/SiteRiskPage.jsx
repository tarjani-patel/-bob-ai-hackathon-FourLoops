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
  Filter, 
  Lock 
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { RiskBadge, SeverityBadge, TrendBadge } from "../components/RiskBadge.jsx";
import { RoleBadge } from "../auth/RoleBadge.jsx";
import { SiteDetailDrawer } from "../components/SiteDetailDrawer.jsx";
import { DeviationDetailDrawer } from "../components/DeviationDetailDrawer.jsx";
import { AccessRestricted } from "../auth/AccessRestricted.jsx";
import { getVisibleSites } from "../auth/dataScoping.js";

export function SiteRiskPage() {
  const { siteRisks, deviations } = useTrial();
  const { user, isInvestigator } = useAuth();
  const location = useLocation();

  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [filterBand, setFilterBand] = useState("All");

  // Scoped sites
  const scopedSites = getVisibleSites(user, siteRisks);

  // Support deep-linking via query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectParam = params.get("select");
    if (selectParam) {
      const match = siteRisks.find((s) => s.siteId === selectParam || s.siteCode === selectParam);
      if (match) setSelectedSiteId(match.siteId);
    }
  }, [location.search, siteRisks]);

  // If Investigator, verify they aren't attempting to inspect another site
  const isSelectedSiteForbidden = 
    isInvestigator && selectedSiteId && selectedSiteId !== user.assignedSite;

  if (isSelectedSiteForbidden) {
    return (
      <AccessRestricted
        restrictedSiteId={selectedSiteId}
        customMessage="You only have access to your assigned clinical site."
      />
    );
  }

  const filteredSites = scopedSites.filter((s) => {
    if (filterBand !== "All" && s.riskBand !== filterBand) return false;
    return true;
  });

  const selectedSite = selectedSiteId ? siteRisks.find((s) => s.siteId === selectedSiteId) : null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isInvestigator ? "Site 03 Risk Profile & Monitoring Status" : "Site Risk & Monitoring Index"}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {isInvestigator ? "Assigned Center: Metro General" : "5 Active Investigation Centers"}
            </span>
            <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {isInvestigator
              ? "Objective risk score and violation trends for Metro General Health Science Center (SITE-03) under ICH GCP E6(R2)."
              : "Deterministic risk engine continuously ranks trial investigation sites from patient deviation density and severity. Click any site to inspect risk drivers and predictive trajectory."}
          </p>
        </div>

        {!isInvestigator ? (
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
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>Site Scoped: SITE-03</span>
          </div>
        )}
      </div>

      {/* Sites Grid */}
      <div className={`grid gap-5 ${isInvestigator ? "grid-cols-1 max-w-2xl" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
        {filteredSites.map((site) => {
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
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {site.siteCode}
                    </span>
                    <RiskBadge band={site.riskBand} score={site.score} />
                  </div>
                  <TrendBadge direction={site.trendDirection} percentage={site.trendChangePercent} />
                </div>

                {/* Site Name */}
                <h3 className="mt-3 font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                  {site.siteName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Principal Investigator: <span className="font-medium text-slate-700">{site.piName || site.pi}</span>
                </p>

                {/* Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Enrolled Cohort</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{site.patientCount} Patients</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Active Deviations</span>
                    <div className="font-semibold text-rose-600 mt-0.5 font-mono">
                      {site.deviationCount} ({site.criticalDeviations ?? site.criticalCount ?? 0} Critical)
                    </div>
                  </div>
                </div>

                {/* Drivers summary */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Primary Risk Driver: </span>
                  {site.topDrivers?.[0]?.driver || site.riskDrivers?.[0] || "Good protocol adherence"}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
                <span>View Comprehensive Risk Breakdown</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawers */}
      <SiteDetailDrawer
        site={selectedSite}
        deviations={deviations}
        onClose={() => setSelectedSiteId(null)}
        onSelectDeviation={(dev) => {
          setSelectedSiteId(null);
          setSelectedDeviation(dev);
        }}
      />

      <DeviationDetailDrawer
        deviation={selectedDeviation}
        onClose={() => setSelectedDeviation(null)}
      />
    </div>
  );
}
