import React, { useState } from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Play, 
  RotateCw, 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  Activity,
  FileCheck,
  Stethoscope,
  ChevronRight,
  Clock
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { useTrial } from "../context/TrialContext.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { RiskBadge, SeverityBadge, TrendBadge } from "../components/RiskBadge.jsx";
import { DeviationDetailDrawer } from "../components/DeviationDetailDrawer.jsx";
import { PatientDetailDrawer } from "../components/PatientDetailDrawer.jsx";
import { generateTrialTrajectoryChartData } from "../logic/trendEngine.js";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const { 
    trialMetrics, 
    siteRisks, 
    deviations, 
    patients,
    patientProfiles,
    executiveInsight, 
    runComplianceAnalysis, 
    resetToBaseline,
    hasAnalyzed,
    isAnalyzing, 
    analysisProgress,
    lastAnalysisResult 
  } = useTrial();

  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const navigate = useNavigate();

  const trajectoryData = generateTrialTrajectoryChartData(siteRisks);

  // Site risk chart data
  const siteBarData = siteRisks.map((s) => ({
    name: s.siteCode,
    fullName: s.siteName,
    score: s.score,
    band: s.riskBand,
    deviations: s.deviationCount
  }));

  const openDeviationsCount = deviations.filter((d) => d.status !== "Resolved").length;
  const criticalCount = deviations.filter((d) => d.severity === "Critical").length;
  const majorCount = deviations.filter((d) => d.severity === "Major").length;

  const highestRiskSite = siteRisks.find((s) => s.riskBand === "High") || siteRisks[0];

  const handleSelectPatient = (patientId) => {
    setSelectedDeviation(null);
    setSelectedPatientId(patientId);
  };

  const selectedPatientObj = patients.find((p) => p.id === selectedPatientId);
  const selectedPatientProf = patientProfiles.find((p) => p.patientId === selectedPatientId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Trial Context & Primary Action */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {trialMetrics.trialId}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {trialMetrics.phase} • Cardiovascular Disease
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            {trialMetrics.trialName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Continuous agentic compliance monitoring active across 5 clinical sites and {patients.length} enrolled participants. Deterministic protocol evaluation verified against Protocol v3.2.
          </p>
        </div>

        {/* Prominent Run Compliance Analysis Call-to-Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={runComplianceAnalysis}
            disabled={isAnalyzing}
            className={`px-5 py-3 rounded-lg text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
              isAnalyzing 
                ? "bg-blue-800 cursor-wait" 
                : "bg-blue-700 hover:bg-blue-800 hover:shadow"
            }`}
          >
            {isAnalyzing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Running Deterministic Scan ({analysisProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Compliance Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Progress / Success Notification Banner */}
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span className="flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-700" />
              Evaluating visit windows, medication logs, and safety lab bounds across all {patients.length} subject records...
            </span>
            <span>{analysisProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Pre-Analysis Ingestion Banner */}
      {!hasAnalyzed && !isAnalyzing && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 mt-0.5">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                Trial Ingestion Synchronized — Ready for Deterministic Analysis
              </h3>
              <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                104 participant eCRF records across 5 clinical sites ingested. Run the compliance analysis to evaluate protocol visit windows, dosing, prohibited conmeds, and safety laboratory bounds.
              </p>
            </div>
          </div>
          <button
            onClick={runComplianceAnalysis}
            className="px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Compliance Analysis Now</span>
          </button>
        </div>
      )}

      {lastAnalysisResult && !isAnalyzing && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Compliance Analysis Completed Successfully at {lastAnalysisResult.timestamp}
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Deterministic engine evaluated {lastAnalysisResult.patientsEvaluated} patients across 5 sites. Detected {lastAnalysisResult.deviationsDetected} deviations ({lastAnalysisResult.criticalCount} Critical, {lastAnalysisResult.majorCount} Major). High risk flagged at {lastAnalysisResult.highestRiskSite}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/deviations")}
              className="text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors"
            >
              Review Findings ({deviations.length}) →
            </button>
            <button
              onClick={resetToBaseline}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-md transition-colors"
              title="Reset cohort state to demonstrate compliance analysis workflow again"
            >
              Reset Baseline
            </button>
          </div>
        </div>
      )}

      {/* High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Trial Risk"
          value={`${trialMetrics.trialRiskScore}/100`}
          subtext="Deterministic weighted score"
          icon={ShieldAlert}
          badge={<RiskBadge band={trialMetrics.trialRiskBand} score={trialMetrics.trialRiskScore} size="sm" />}
          alertLevel={trialMetrics.trialRiskScore >= 61 ? "danger" : trialMetrics.trialRiskScore >= 31 ? "warning" : "success"}
          onClick={() => navigate("/sites")}
        />

        <MetricCard
          title="Protocol Compliance Rate"
          value={`${trialMetrics.compliancePercentage}%`}
          subtext={`${patients.length} enrolled participants`}
          icon={FileCheck}
          badge={<span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">GCP Validated</span>}
          alertLevel="success"
          onClick={() => navigate("/trial-protocol")}
        />

        <MetricCard
          title="Open Deviations"
          value={openDeviationsCount}
          subtext={`${criticalCount} Critical • ${majorCount} Major`}
          icon={AlertTriangle}
          badge={<span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">Action Req</span>}
          alertLevel={criticalCount > 0 ? "danger" : "warning"}
          onClick={() => navigate("/deviations")}
        />

        <MetricCard
          title="Sites Requiring Attention"
          value={`${trialMetrics.highRiskSitesCount} High / ${trialMetrics.mediumRiskSitesCount} Med`}
          subtext={highestRiskSite ? `Highest: ${highestRiskSite.siteCode} (${highestRiskSite.score}/100)` : "All sites within bounds"}
          icon={Building2}
          badge={<span className="text-xs font-bold text-rose-700 font-mono">SITE-03</span>}
          alertLevel="danger"
          onClick={() => navigate("/sites")}
        />
      </div>

      {/* AI Insight & Executive Copilot Recommendation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                TrialGuard AI Compliance Insights & Actions
              </h2>
              <p className="text-[11px] text-slate-500">Autonomous risk synthesis generated from deterministic findings</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            Urgent Site Action Required
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">{executiveInsight.title}</h3>
            <p className="text-slate-600 leading-relaxed">{executiveInsight.summary}</p>
            <div className="pt-2 flex items-center gap-2">
              <span className="font-bold text-slate-800">Action:</span>
              <span className="text-slate-700">{executiveInsight.actionRecommendation}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Escalated Site Profile</span>
              <div className="mt-1 font-bold text-slate-900 text-sm">{highestRiskSite.siteName}</div>
              <div className="mt-1 flex items-center gap-2">
                <RiskBadge band={highestRiskSite.riskBand} score={highestRiskSite.score} size="sm" />
                <TrendBadge trend={highestRiskSite.trend} projectedChange={highestRiskSite.projectedChange} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => navigate("/sites")}
                className="flex-1 text-center py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold"
              >
                Inspect Site 03
              </button>
              <button
                onClick={() => navigate("/capa")}
                className="flex-1 text-center py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold"
              >
                Open CAPAs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deviations Over Time (Recharts Line) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Deviation Detection Trajectory</h2>
              <p className="text-xs text-slate-500">Cumulative protocol violations vs resolved events over 5 weeks</p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Weekly Cohort
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", fontSize: 12, borderRadius: 8, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                />
                <Line type="monotone" dataKey="deviations" name="Total Deviations" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="critical" name="Critical Events" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#16a34a" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Site Risk Distribution (Recharts Bar) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Site Risk Index (0–100 Scale)</h2>
              <p className="text-xs text-slate-500">Objective risk normalized from deviation density & severity</p>
            </div>
            <button 
              onClick={() => navigate("/sites")}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>Rankings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", fontSize: 12, borderRadius: 8 }}
                  formatter={(val, name, item) => [`${val}/100 (${item.payload.band} Risk)`, "Calculated Risk"]}
                />
                <Bar 
                  dataKey="score" 
                  name="Risk Score" 
                  fill="#1d4ed8" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Deviations Feed & Quick Drill-Down */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Protocol Deviations</h2>
            <p className="text-xs text-slate-500">Latest objective findings detected by the compliance engine</p>
          </div>
          <button
            onClick={() => navigate("/deviations")}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>View All ({deviations.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Deviation ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Finding Summary</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deviations.slice(0, 6).map((dev) => (
                <tr 
                  key={dev.id} 
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedDeviation(dev)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {dev.id}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {dev.patientId}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {dev.siteName}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {dev.category}
                  </td>
                  <td className="py-3 px-4">
                    <SeverityBadge severity={dev.severity} showWeight={true} />
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {dev.actual}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeviation(dev);
                      }}
                      className="text-xs font-semibold text-blue-700 group-hover:text-blue-900 bg-white border border-slate-200 group-hover:border-blue-300 px-2.5 py-1 rounded transition-colors"
                    >
                      Compare →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawers for Drill-Down */}
      <DeviationDetailDrawer
        deviation={selectedDeviation}
        onClose={() => setSelectedDeviation(null)}
        onSelectPatient={handleSelectPatient}
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
