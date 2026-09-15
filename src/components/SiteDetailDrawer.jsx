import React from "react";
import { 
  X, 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  FileText, 
  Sparkles,
  CheckCircle2,
  Calendar,
  ExternalLink
} from "lucide-react";
import { RiskBadge, SeverityBadge, TrendBadge } from "./RiskBadge.jsx";
import { useNavigate } from "react-router-dom";

export function SiteDetailDrawer({ site, onClose, onSelectDeviation }) {
  const navigate = useNavigate();
  if (!site) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-fade animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {site.siteCode}
              </span>
              <RiskBadge band={site.riskBand} score={site.score} size="md" />
              <TrendBadge trend={site.trend} projectedChange={site.projectedChange} />
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-900">
              {site.siteName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {site.location} • PI: <span className="font-medium text-slate-700">{site.pi}</span> • CRA: <span className="font-medium text-slate-700">{site.cra}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Risk Metrics Cards */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Site Risk</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{site.score}</div>
              <span className="text-[10px] text-slate-500">{site.riskBand} band</span>
            </div>
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-700">Predicted</span>
              <div className="text-xl font-bold text-blue-900 font-mono mt-0.5">{site.predictedScore}</div>
              <span className="text-[10px] text-blue-600">30-day forecast</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Deviations</span>
              <div className="text-xl font-bold text-rose-600 font-mono mt-0.5">{site.deviationCount}</div>
              <span className="text-[10px] text-slate-500">{site.criticalCount} Critical</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Cohort Impact</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                {site.affectedPatientCount}/{site.patientCount}
              </div>
              <span className="text-[10px] text-slate-500">
                {((site.affectedPatientCount / (site.patientCount || 1)) * 100).toFixed(0)}% affected
              </span>
            </div>
          </div>

          {/* Predicted Risk & Trajectory Notice */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  30-Day Predictive Risk Trajectory
                </h3>
              </div>
              <span className="text-[10px] font-mono text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded">
                HEURISTIC FORECAST
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-700 leading-relaxed">
              {site.predictionRationale}
            </p>

            <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-white border border-blue-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Current Score:</span>
                <span className="font-bold text-slate-900 font-mono">{site.score}/100</span>
              </div>
              <div className="text-slate-400">→</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Predicted 30-Day:</span>
                <span className={`font-bold font-mono ${site.predictedScore >= 61 ? "text-rose-600" : "text-amber-600"}`}>
                  {site.predictedScore}/100 ({site.predictedBand})
                </span>
              </div>
              <div className="text-[11px] text-slate-400 italic">
                {site.disclaimer}
              </div>
            </div>
          </div>

          {/* Key Risk Drivers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Primary Risk Drivers Identified by Engine
            </h3>
            <div className="space-y-2">
              {site.riskDrivers?.map((driver, i) => (
                <div key={i} className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0"></span>
                  <span className="leading-relaxed font-medium">{driver}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deviation Categories Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <FileText className="w-4 h-4 text-slate-600" />
              Deviation Breakdown by Category
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(site.categoryBreakdown || {}).map(([cat, count]) => (
                <div key={cat} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate">{cat}</span>
                  <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Deviations at this Site */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Site Deviations ({site.deviations?.length || 0})
              </h3>
              <span className="text-[10px] text-slate-400">Click to view Protocol vs Actual</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {site.deviations?.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => onSelectDeviation && onSelectDeviation(dev)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{dev.id}</span>
                      <span className="font-mono text-slate-600">[{dev.patientId}]</span>
                      <SeverityBadge severity={dev.severity} />
                    </div>
                    <p className="mt-0.5 text-slate-600 line-clamp-1">{dev.actual}</p>
                  </div>
                  <span className="text-[11px] text-blue-700 font-medium">Inspect →</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Site-Level Actions */}
          <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs">
            <h4 className="font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Recommended Monitoring Oversight Action
            </h4>
            <p className="mt-1.5 text-emerald-950 leading-relaxed">
              {site.riskBand === "High"
                ? `Immediate on-site audit mandated for ${site.siteCode}. Schedule coordinator retraining, inspect pharmacy dispensation records, and file CAPA notification within 48 hours.`
                : site.riskBand === "Medium"
                ? `Initiate targeted remote monitoring and review source data verification for outstanding queries.`
                : `Maintain standard routine risk-based monitoring interval.`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              navigate("/capa");
              onClose();
            }}
            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold"
          >
            <span>View CAPA Actions</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
