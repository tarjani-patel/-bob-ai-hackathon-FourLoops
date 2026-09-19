import React, { useState, useEffect, useMemo } from "react";
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
  ExternalLink,
  Loader2,
  Info,
  Compass,
  Calculator,
  Layers
} from "lucide-react";
import { RiskBadge, SeverityBadge, TrendBadge } from "./RiskBadge.jsx";
import { getSiteInsightWithAI } from "../api/trialApi.js";
import { useNavigate } from "react-router-dom";

export function SiteDetailDrawer({ site, deviations = [], onClose, onSelectDeviation }) {
  const navigate = useNavigate();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    setAiInsight(null);
    setAiError(null);
    setAiLoading(false);
  }, [site?.siteCode || site?.id]);

  // Resolve site deviations with fallback to trial deviations
  const siteDeviations = useMemo(() => {
    if (!site) return [];
    if (site.deviations && site.deviations.length > 0) return site.deviations;
    const sId = (site.siteId || site.siteCode || site.id || "").toUpperCase();
    return deviations.filter(d => (d.siteId || "").toUpperCase() === sId);
  }, [site, deviations]);

  // Severity metrics
  const criticalCount = site?.criticalCount ?? siteDeviations.filter(d => d.severity === "Critical").length;
  const majorCount = site?.majorCount ?? siteDeviations.filter(d => d.severity === "Major").length;
  const minorCount = site?.minorCount ?? siteDeviations.filter(d => d.severity === "Minor").length;
  const adminCount = site?.adminCount ?? siteDeviations.filter(d => d.severity === "Administrative").length;
  const totalDevCount = site?.deviationCount ?? siteDeviations.length;

  // Mathematical point calculation breakdown
  const critPoints = criticalCount * 15;
  const majorPoints = majorCount * 10;
  const minorPoints = minorCount * 4;
  const adminPoints = adminCount * 1;
  const severityPoints = critPoints + majorPoints + minorPoints + adminPoints;

  // Modifiers
  const repeatedDevCount = site?.repeatedDeviationCount ?? 0;
  const repeatedModifier = repeatedDevCount > 0 ? 5 : 0;
  
  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    if (site?.categoryBreakdown && Object.keys(site.categoryBreakdown).length > 0) {
      return site.categoryBreakdown;
    }
    const counts = {};
    siteDeviations.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [site, siteDeviations]);

  const distinctCategories = site?.numberOfCategories || Object.keys(categoryBreakdown).length;
  const multiCatModifier = distinctCategories > 1 ? 5 : 0;
  const rawPoints = site?.rawRiskPoints ?? (severityPoints + repeatedModifier + multiCatModifier);
  const normalizedScore = site?.score ?? Math.min(100, Math.max(0, Math.round((rawPoints / 225) * 100)));
  const cohortPct = site?.patientCount > 0 ? Math.round(((site.affectedPatientCount || 0) / site.patientCount) * 100) : 0;

  // Top drivers fallback
  const riskDriversList = useMemo(() => {
    if (site?.riskDrivers && site.riskDrivers.length > 0) return site.riskDrivers;
    if (site?.topDrivers && site.topDrivers.length > 0) return site.topDrivers.map(d => typeof d === "string" ? d : d.driver);
    if (criticalCount > 0) return ["Critical safety deviations detected in clinical protocol assessments"];
    if (majorCount > 0) return ["Major visit window or procedural anomalies observed"];
    return ["Good protocol adherence; zero critical deviations detected"];
  }, [site, criticalCount, majorCount]);

  if (!site) return null;

  const handleGenerateInsight = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await getSiteInsightWithAI({
        siteId: site.siteCode || site.id,
        siteName: site.siteName,
        score: normalizedScore,
        riskBand: site.riskBand,
        trend: site.trend?.trend || site.trend || "Stable",
        predictedScore: site.predictedScore ?? site.trend?.predictedScore ?? normalizedScore,
        criticalCount,
        majorCount,
        deviationCount: totalDevCount,
        topDrivers: riskDriversList,
        recentDeviations: siteDeviations.slice(0, 5).map(d => ({
          id: d.id,
          category: d.category,
          severity: d.severity,
          actual: d.actual
        }))
      });
      setAiInsight(res);
    } catch (err) {
      console.warn("AI site insight error:", err);
      setAiError(err.message || "IBM Granite AI service is currently unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

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
          {/* Top Risk Metrics Cards */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Risk Score</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{normalizedScore}/100</div>
              <span className="text-[10px] text-slate-500 font-semibold">{site.riskBand} Band</span>
            </div>
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-700">30d Forecast</span>
              <div className="text-xl font-bold text-blue-900 font-mono mt-0.5">
                {site.predictedScore ?? site.trend?.predictedScore ?? normalizedScore}/100
              </div>
              <span className="text-[10px] text-blue-600 font-semibold">{site.predictedBand ?? site.trend?.predictedBand ?? site.riskBand}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Deviations</span>
              <div className="text-xl font-bold text-rose-600 font-mono mt-0.5">{totalDevCount}</div>
              <span className="text-[10px] text-slate-500">{criticalCount} Critical</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Cohort Impact</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                {site.affectedPatientCount || 0}/{site.patientCount || 1}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">{cohortPct}% impacted</span>
            </div>
          </div>

          {/* 1. SEVERITY BREAKDOWN GRID */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Deviations by Severity & Protocol Weight
              </h3>
              <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                DETERMINISTIC WEIGHTS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <div className="text-[10px] uppercase font-bold text-rose-700">Critical</div>
                <div className="text-xl font-bold text-rose-900 font-mono mt-0.5">{criticalCount}</div>
                <div className="text-[10px] text-rose-600 mt-0.5">15 pts each ({critPoints} pts)</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="text-[10px] uppercase font-bold text-orange-700">Major</div>
                <div className="text-xl font-bold text-orange-900 font-mono mt-0.5">{majorCount}</div>
                <div className="text-[10px] text-orange-600 mt-0.5">10 pts each ({majorPoints} pts)</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-[10px] uppercase font-bold text-amber-700">Minor</div>
                <div className="text-xl font-bold text-amber-900 font-mono mt-0.5">{minorCount}</div>
                <div className="text-[10px] text-amber-600 mt-0.5">4 pts each ({minorPoints} pts)</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-700">Admin</div>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{adminCount}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">1 pt each ({adminPoints} pts)</div>
              </div>
            </div>
          </div>

          {/* 2. SCORE CONTRIBUTION & FORMULA EXPLANATION */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Score Contribution & Engine Derivation
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded">
                SCALE: 0–100
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Why this site received a risk score of <strong className="text-slate-900 font-mono">{normalizedScore}/100</strong>:
              Calculated deterministically from severity point summation plus protocol compliance penalties, normalized against the extreme risk benchmark (225 pts).
            </p>

            <div className="p-3 rounded-lg bg-white border border-blue-100 divide-y divide-slate-100 text-xs font-mono">
              <div className="pb-2 flex items-center justify-between">
                <span className="text-slate-600 font-sans">Base Severity Points:</span>
                <span className="font-bold text-slate-900">
                  {critPoints} (Crit) + {majorPoints} (Maj) + {minorPoints} (Min) + {adminPoints} (Adm) = {severityPoints} pts
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 font-sans">Recurrent Deviation Modifier:</span>
                <span className={`font-bold ${repeatedModifier > 0 ? "text-rose-600" : "text-slate-500"}`}>
                  +{repeatedModifier} pts ({repeatedDevCount} repeated events)
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-600 font-sans">Multi-Category Penalty:</span>
                <span className={`font-bold ${multiCatModifier > 0 ? "text-amber-600" : "text-slate-500"}`}>
                  +{multiCatModifier} pts ({distinctCategories} distinct categories)
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between bg-blue-50/50 -mx-3 -mb-3 px-3 py-2.5 rounded-b-lg border-t border-blue-100 font-bold">
                <span className="text-blue-900 font-sans">Normalized Score:</span>
                <span className="text-blue-900 text-sm">
                  min(100, round(({rawPoints} / 225) × 100)) = {normalizedScore}/100 ({site.riskBand})
                </span>
              </div>
            </div>
          </div>

          {/* 3. 30-DAY PREDICTIVE TRAJECTORY */}
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
              {site.predictionRationale || site.trend?.predictionRationale || "Deterministic heuristic trajectory evaluated from deviation velocity and recurrent cluster patterns."}
            </p>

            <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-white border border-blue-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Current Score:</span>
                <span className="font-bold text-slate-900 font-mono">{normalizedScore}/100</span>
              </div>
              <div className="text-slate-400">→</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Predicted 30-Day:</span>
                <span className={`font-bold font-mono ${(site.predictedScore ?? site.trend?.predictedScore ?? normalizedScore) >= 61 ? "text-rose-600" : "text-amber-600"}`}>
                  {site.predictedScore ?? site.trend?.predictedScore ?? normalizedScore}/100 ({site.predictedBand ?? site.trend?.predictedBand ?? site.riskBand})
                </span>
              </div>
              <div className="text-[11px] text-slate-400 italic">
                Deterministic velocity model
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* IBM watsonx.ai Granite Site Pattern & Risk Insights          */}
          {/* ============================================================ */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-purple-50/20 to-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  IBM Granite Site Risk Intelligence
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                ibm/granite-3-8b-instruct
              </span>
            </div>

            {!aiInsight && !aiLoading && !aiError && (
              <div className="p-3 bg-white rounded-lg border border-indigo-100 flex items-center justify-between gap-3 text-xs">
                <p className="text-slate-600">
                  Synthesize site deviation patterns, emerging operational risks, and monitoring focus areas with IBM Granite.
                </p>
                <button
                  onClick={handleGenerateInsight}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Site with AI</span>
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="p-4 bg-white rounded-lg border border-indigo-100 flex items-center justify-center gap-3 text-xs text-indigo-800">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="font-medium">Evaluating site deviation patterns with IBM Granite...</span>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>AI service offline. Deterministic site risk score remains authoritative.</span>
                </div>
                <button
                  onClick={handleGenerateInsight}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {aiInsight && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-indigo-100 space-y-2.5">
                  <div>
                    <div className="font-semibold text-indigo-950 mb-0.5">Site Risk Synthesis:</div>
                    <p className="text-slate-700 leading-relaxed">{aiInsight.riskAssessment}</p>
                  </div>

                  {aiInsight.importantPatterns?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="font-semibold text-slate-800 mb-1">Identified Systemic Patterns:</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-600">
                        {aiInsight.importantPatterns.map((pattern, idx) => (
                          <li key={idx}>{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiInsight.emergingRiskExplanation && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-800">Emerging Risk Trajectory: </span>
                      <span className="text-slate-600">{aiInsight.emergingRiskExplanation}</span>
                    </div>
                  )}

                  {aiInsight.recommendedInvestigationAreas?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Recommended CRA / Auditor Focus Areas:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        {aiInsight.recommendedInvestigationAreas.map((area, idx) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="p-2 bg-indigo-50/50 rounded border border-indigo-100 text-[10px] text-indigo-900 leading-tight">
                  <span className="font-semibold">Notice:</span> {aiInsight.humanReviewNotice}
                </div>
              </div>
            )}
          </div>

          {/* Key Risk Drivers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Primary Risk Drivers Identified by Engine
            </h3>
            <div className="space-y-2">
              {riskDriversList.map((driver, i) => (
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
              {Object.entries(categoryBreakdown).length > 0 ? (
                Object.entries(categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="font-medium text-slate-700 truncate">{cat}</span>
                    <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {count}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-3 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  Zero active deviation categories recorded for this center.
                </div>
              )}
            </div>
          </div>

          {/* Recent Deviations at this Site */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-600" />
                Site Deviations Register ({siteDeviations.length})
              </h3>
              <span className="text-[10px] text-slate-400">Click to view Protocol vs Actual</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {siteDeviations.length > 0 ? (
                siteDeviations.map((dev) => (
                  <div
                    key={dev.id}
                    onClick={() => onSelectDeviation && onSelectDeviation(dev)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between text-xs group"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {dev.id}
                        </span>
                        <span className="font-mono text-slate-600 text-[11px]">
                          [{dev.patientId}]
                        </span>
                        <SeverityBadge severity={dev.severity} />
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {dev.category}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-1">{dev.actual || dev.rule}</p>
                    </div>
                    <span className="text-[11px] text-blue-700 font-bold flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                      Inspect →
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-center text-xs">
                  Zero active deviations recorded for this center.
                </div>
              )}
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
                ? `Immediate on-site audit mandated for ${site.siteCode || site.siteId}. Schedule coordinator retraining, inspect pharmacy dispensation records, and file CAPA notification within 48 hours.`
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
