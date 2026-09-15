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
  Clock, 
  Lock, 
  Database, 
  Crown, 
  ShieldCheck, 
  AlertOctagon, 
  FileText,
  UserCheck
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
import { useAuth } from "../auth/AuthContext.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { RiskBadge, SeverityBadge, TrendBadge } from "../components/RiskBadge.jsx";
import { RoleBadge } from "../auth/RoleBadge.jsx";
import { DeviationDetailDrawer } from "../components/DeviationDetailDrawer.jsx";
import { PatientDetailDrawer } from "../components/PatientDetailDrawer.jsx";
import { generateTrialTrajectoryChartData } from "../logic/trendEngine.js";
import { getVisiblePatients, getVisibleDeviations, getVisibleSites } from "../auth/dataScoping.js";
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
    lastAnalysisResult,
    capas,
    auditLogs,
    editPatientData
  } = useTrial();

  const { user, isInvestigator, isDataManager, isSponsor, isCRA, can } = useAuth();
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [dataFixSuccess, setDataFixSuccess] = useState("");
  const navigate = useNavigate();

  // Scoped data arrays according to role
  const scopedDeviations = getVisibleDeviations(user, deviations);
  const scopedPatients = getVisiblePatients(user, patients);
  const scopedSites = getVisibleSites(user, siteRisks);

  const trajectoryData = generateTrialTrajectoryChartData(siteRisks);

  // Site risk chart data (for trial-wide roles)
  const siteBarData = siteRisks.map((s) => ({
    name: s.siteCode,
    fullName: s.siteName,
    score: s.score,
    band: s.riskBand,
    deviations: s.deviationCount
  }));

  const openDeviationsCount = scopedDeviations.filter((d) => d.status !== "Resolved").length;
  const criticalCount = scopedDeviations.filter((d) => d.severity === "Critical").length;
  const majorCount = scopedDeviations.filter((d) => d.severity === "Major").length;

  const assignedSiteId = user?.assignedSite || "SITE-03";
  const userSite = siteRisks.find((s) => s.siteId === assignedSiteId) || siteRisks[0];
  const highestRiskSite = siteRisks.find((s) => s.riskBand === "High") || siteRisks[0];

  // Data Manager specific metric calculations
  const missingLabsCount = patients.filter((p) => !p.labs?.some((l) => l.labName.includes("CBC"))).length;
  const doseDiscrepanciesCount = patients.filter((p) => p.medications?.some((m) => m.drugName === "Cardio-X" && m.doseMg !== 100)).length;
  const dataQualityDevsCount = deviations.filter((d) => d.category === "Data Quality" || d.severity === "Administrative").length;
  const cleanSubjectsCount = patients.filter((p) => {
    const hasCbc = p.labs?.some((l) => l.labName.includes("CBC"));
    const correctDose = !p.medications?.some((m) => m.drugName === "Cardio-X" && m.doseMg !== 100);
    const vitalsRecorded = !p.visits?.some((v) => v.visitNumber === 2 && !v.vitals);
    return hasCbc && correctDose && vitalsRecorded;
  }).length;
  const completenessPercent = Math.round((cleanSubjectsCount / patients.length) * 100);

  const handleSelectPatient = (patientId) => {
    setSelectedDeviation(null);
    setSelectedPatientId(patientId);
  };

  const selectedPatientObj = patients.find((p) => p.id === selectedPatientId);
  const selectedPatientProf = patientProfiles.find((p) => p.patientId === selectedPatientId);

  // Data Manager Quick eCRF Corrections
  const handleQuickFixLab = (patientId) => {
    editPatientData(
      patientId,
      (pt) => {
        const hasCbc = pt.labs.some((l) => l.labName.includes("CBC"));
        if (hasCbc) return pt;
        return {
          ...pt,
          labs: [
            ...pt.labs,
            {
              labName: "Complete Blood Count (CBC)",
              date: "2026-01-20",
              status: "Completed",
              value: "Normal (WBC 6.2, Hgb 14.1, Plt 240)",
              unit: "cells/mcL"
            }
          ]
        };
      },
      `Clinical Data Manager uploaded missing CBC panel for subject ${patientId}.`,
      user
    );
    setDataFixSuccess(`CBC lab entered for ${patientId}. Re-run Compliance Analysis to clear deviation!`);
    setTimeout(() => setDataFixSuccess(""), 4000);
  };

  const handleQuickFixDose = (patientId) => {
    editPatientData(
      patientId,
      (pt) => ({
        ...pt,
        medications: pt.medications.map((m) =>
          m.drugName === "Cardio-X" ? { ...m, doseMg: 100 } : m
        )
      }),
      `Clinical Data Manager corrected investigational dose for ${patientId} from 150mg to protocol-mandated 100mg QD.`,
      user
    );
    setDataFixSuccess(`Cardio-X dose corrected to 100mg for ${patientId}. Re-run Compliance Analysis to verify.`);
    setTimeout(() => setDataFixSuccess(""), 4000);
  };

  const handleQuickFixVitals = (patientId) => {
    editPatientData(
      patientId,
      (pt) => ({
        ...pt,
        visits: pt.visits.map((v) =>
          v.visitNumber === 2 && !v.vitals
            ? { ...v, vitals: { bpSystolic: 124, bpDiastolic: 80, heartRate: 72 } }
            : v
        )
      }),
      `Clinical Data Manager reconciled unentered Visit 2 vital signs for ${patientId}.`,
      user
    );
    setDataFixSuccess(`Visit 2 vitals recorded for ${patientId}. Data query resolved.`);
    setTimeout(() => setDataFixSuccess(""), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner: Trial Context, Active Persona & Primary Action */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {trialMetrics.trialId}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {trialMetrics.phase} • Cardiovascular Disease
            </span>
            <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isInvestigator 
              ? "My Site Overview" 
              : isDataManager
              ? "Data Quality Overview"
              : isSponsor
              ? "Trial Executive Overview"
              : "Trial Monitoring Overview"}
          </h1>

          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {isInvestigator ? (
              <>
                Principal Investigator {user?.name || "Dr. Evelyn Zhao, MD"}. Scoped strictly to <span className="font-semibold text-purple-700">{user?.assignedSite ? `${user.assignedSite}` : "Metro General (SITE-03)"}</span> under 21 CFR 312 GCP Investigator isolation guidelines. Monitoring {scopedPatients.length} enrolled subjects.
              </>
            ) : isDataManager ? (
              <>
                Data Manager {user?.name || "Marcus Vance"}. Focused on data completeness, missing laboratory panels, eCRF validation issues, and dosage consistency across {patients.length} subject records.
              </>
            ) : isSponsor ? (
              <>
                Study Manager {user?.name || "Elena Rostova"}. Full trial governance across all 5 clinical sites, final CAPA authorization, and 21 CFR Part 11 compliant audit trail surveillance.
              </>
            ) : (
              <>
                Clinical Research Associate {user?.name || "Sarah Jenkins, CCRA"}. Continuous trial-wide monitoring active across 5 clinical sites and {patients.length} enrolled participants.
              </>
            )}
          </p>
        </div>

        {/* Action Button: Role-Aware */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {can("RUN_COMPLIANCE_ANALYSIS") ? (
            <button
              onClick={() => runComplianceAnalysis(user)}
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
          ) : (
            <div className="px-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Central Analysis Managed by CRA / Sponsor</span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Progress / Ingestion Banner */}
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span className="flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-700" />
              Evaluating visit windows, medication logs, and safety lab bounds across subject records...
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

      {/* Pre-Analysis Ingestion Alert Banner */}
      {!hasAnalyzed && !isAnalyzing && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 mt-0.5">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                {isInvestigator ? "Site 03 Intake Ingested — Ready for Verification" : "Trial Ingestion Synchronized — Ready for Deterministic Analysis"}
              </h3>
              <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                {isInvestigator
                  ? "22 participant eCRF records for Metro General synchronized. Scan evaluates visit intervals and medication compliance."
                  : "104 participant eCRF records across 5 clinical sites ingested. Run the compliance analysis to evaluate protocol visit windows, dosing, prohibited conmeds, and safety laboratory bounds."}
              </p>
            </div>
          </div>
          {can("RUN_COMPLIANCE_ANALYSIS") && (
            <button
              onClick={() => runComplianceAnalysis(user)}
              className="px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Compliance Analysis Now</span>
            </button>
          )}
        </div>
      )}

      {/* Analysis Result Banner */}
      {lastAnalysisResult && !isAnalyzing && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Compliance Verification Completed at {lastAnalysisResult.timestamp}
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                {isInvestigator
                  ? `Deterministic engine evaluated ${scopedPatients.length} patients at Site 03. ${scopedDeviations.length} deviations active.`
                  : `Evaluated ${lastAnalysisResult.patientsEvaluated} patients across 5 sites. Detected ${lastAnalysisResult.deviationsDetected} deviations (${lastAnalysisResult.criticalCount} Critical, ${lastAnalysisResult.majorCount} Major). High risk flagged at ${lastAnalysisResult.highestRiskSite}.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/deviations")}
              className="text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors"
            >
              Review Deviations ({scopedDeviations.length}) →
            </button>
            {can("RUN_COMPLIANCE_ANALYSIS") && (
              <button
                onClick={resetToBaseline}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-md transition-colors"
                title="Reset cohort state to demonstrate compliance analysis workflow again"
              >
                Reset Demo
              </button>
            )}
          </div>
        </div>
      )}

      {/* DATA FIX SUCCESS TOAST */}
      {dataFixSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-900 p-3 rounded-lg text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{dataFixSuccess}</span>
          </div>
          {can("RUN_COMPLIANCE_ANALYSIS") && (
            <button
              onClick={() => runComplianceAnalysis(user)}
              className="underline text-teal-700 hover:text-teal-950 font-bold"
            >
              Run Compliance Analysis Now
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE-SPECIFIC SPECIAL SECTION: CLINICAL DATA MANAGER DATA INTEGRITY HUB  */}
      {/* ========================================================================= */}
      {isDataManager && (
        <div className="bg-gradient-to-br from-teal-50/70 to-slate-50 border border-teal-200 rounded-xl p-6 shadow-subtle">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-700" />
                <h2 className="text-base font-bold text-slate-900">
                  eCRF Query & Data Completeness Action Center
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
                  Data Manager Actionable
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Directly correct data entry gaps, missing laboratory panels, and invalid dosing records. Corrected records immediately write to the 21 CFR Part 11 audit log and resolve deviations upon running analysis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Action 1: PT-1046 Missing CBC */}
            <div className="p-3.5 rounded-lg bg-white border border-teal-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-slate-900">PT-1046</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Missing Lab</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">CBC with Differential</div>
                <p className="text-[11px] text-slate-500 mt-1">Lab result not entered prior to Visit 3 primary efficacy endpoint.</p>
              </div>
              <button
                onClick={() => handleQuickFixLab("PT-1046")}
                className="mt-3 w-full py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Upload Lab Result</span>
              </button>
            </div>

            {/* Action 2: PT-1042 Dose Discrepancy */}
            <div className="p-3.5 rounded-lg bg-white border border-teal-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-slate-900">PT-1042</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Dose Discrepancy</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">150mg QD Recorded</div>
                <p className="text-[11px] text-slate-500 mt-1">Protocol mandates 100mg QD. eCRF dose entry discrepancy pending audit.</p>
              </div>
              <button
                onClick={() => handleQuickFixDose("PT-1042")}
                className="mt-3 w-full py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Correct Dose to 100mg</span>
              </button>
            </div>

            {/* Action 3: PT-1030 Missing Vitals */}
            <div className="p-3.5 rounded-lg bg-white border border-teal-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-slate-900">PT-1030</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Missing Vitals</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">Visit 2 Vital Signs</div>
                <p className="text-[11px] text-slate-500 mt-1">Blood pressure and heart rate unrecorded at 14-day study interval.</p>
              </div>
              <button
                onClick={() => handleQuickFixVitals("PT-1030")}
                className="mt-3 w-full py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Record Vitals (124/80)</span>
              </button>
            </div>

            {/* Action 4: PT-1050 Missing CBC */}
            <div className="p-3.5 rounded-lg bg-white border border-teal-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-slate-900">PT-1050</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Missing Lab</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">CBC Panel Pending</div>
                <p className="text-[11px] text-slate-500 mt-1">Safety hematology record missing from central laboratory HL7 feed.</p>
              </div>
              <button
                onClick={() => handleQuickFixLab("PT-1050")}
                className="mt-3 w-full py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Upload Lab Result</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE-SPECIFIC SPECIAL SECTION: SPONSOR / STUDY MANAGER GOVERNANCE VIEW   */}
      {/* ========================================================================= */}
      {isSponsor && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-6 shadow-subtle">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Sponsor Governance & Regulatory Filing Readiness
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Executive Sign-Off Authority
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                You hold sole authority to grant final approval for CAPAs, freeze protocol amendments, and authorize regulatory dossier submissions for FDA / EMA review.
              </p>
            </div>
            <button
              onClick={() => navigate("/capa")}
              className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review Pending CAPAs ({capas.filter(c => c.status !== "Approved").length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">CAPA Approvals</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {capas.filter(c => c.status === "Approved").length} / {capas.length}
                </span>
                <span className="text-emerald-700 font-semibold">Authorized</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">21 CFR Part 11 Audit Trail</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {auditLogs.length} Records
                </span>
                <button 
                  onClick={() => navigate("/settings?tab=audit")}
                  className="text-blue-700 hover:underline font-medium text-[11px]"
                >
                  View Log →
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Trial GCP Readiness</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {trialMetrics.complianceScore}%
                </span>
                <span className="text-blue-700 font-semibold">GCP Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics: Personalised by Clinical Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isDataManager ? (
          <>
            <MetricCard
              title="Data Completeness Index"
              value={`${completenessPercent}%`}
              subtitle={`${cleanSubjectsCount} of ${patients.length} eCRFs verified`}
              trend="eCRF Quality Standard: >90%"
              trendDirection={completenessPercent > 90 ? "up" : "down"}
              icon={CheckCircle2}
            />
            <MetricCard
              title="Missing Lab Panels"
              value={`${missingLabsCount} Subjects`}
              subtitle="CBC panel pending before Visit 3"
              trend={missingLabsCount > 0 ? "Reconciliation Actionable" : "All Labs Ingested"}
              trendDirection={missingLabsCount > 0 ? "down" : "up"}
              icon={AlertTriangle}
            />
            <MetricCard
              title="Dosing & Validation Queries"
              value={`${doseDiscrepanciesCount} Queries`}
              subtitle="Cardio-X non-standard dosage"
              trend="Protocol dose: 100mg QD"
              trendDirection={doseDiscrepanciesCount > 0 ? "down" : "up"}
              icon={Database}
            />
            <MetricCard
              title="Data Quality Deviations"
              value={dataQualityDevsCount}
              subtitle="Administrative & lab discrepancies"
              trend="Re-evaluated on analysis"
              trendDirection="neutral"
              icon={ShieldAlert}
            />
          </>
        ) : isInvestigator ? (
          <>
            <MetricCard
              title={`${userSite.siteCode} Compliance Score`}
              value={`${100 - userSite.score}%`}
              subtitle={`Calculated across ${scopedPatients.length} ${userSite.siteCode} subjects`}
              trend="Site Monitoring Status"
              trendDirection={userSite.riskBand === "High" ? "down" : "up"}
              icon={CheckCircle2}
            />
            <MetricCard
              title={`${userSite.siteCode} Active Deviations`}
              value={openDeviationsCount}
              subtitle={`${criticalCount} Critical • ${majorCount} Major`}
              trend={hasAnalyzed ? `${openDeviationsCount} active issues` : "Baseline issues"}
              trendDirection={openDeviationsCount > 3 ? "down" : "neutral"}
              icon={AlertTriangle}
            />
            <MetricCard
              title={`${userSite.siteCode} Enrolled Cohort`}
              value={`${scopedPatients.length} Subjects`}
              subtitle={userSite.siteName}
              trend={`${userSite.siteCode} participant register`}
              trendDirection="neutral"
              icon={Building2}
            />
            <MetricCard
              title={`${userSite.siteCode} Open CAPAs`}
              value={`${capas.filter((c) => c.siteId === assignedSiteId).length} Open`}
              subtitle="Corrective plans pending response"
              trend="Action Plan Submission Active"
              trendDirection="down"
              icon={ShieldAlert}
            />
          </>
        ) : isSponsor ? (
          <>
            <MetricCard
              title="Trial Compliance Index"
              value={`${trialMetrics.complianceScore}%`}
              subtitle={`Continuous evaluation across ${trialMetrics.totalPatients} subjects`}
              trend="ICH GCP Target: >85%"
              trendDirection="up"
              icon={CheckCircle2}
            />
            <MetricCard
              title="Active Protocol Deviations"
              value={openDeviationsCount}
              subtitle={`${criticalCount} Critical • ${majorCount} Major`}
              trend={hasAnalyzed ? `${openDeviationsCount} active violations` : "Baseline deviations"}
              trendDirection="neutral"
              icon={AlertTriangle}
            />
            <MetricCard
              title="CAPA Approval Queue"
              value={`${capas.filter((c) => c.status !== "Approved").length} Pending`}
              subtitle={`${capas.filter((c) => c.status === "Approved").length} of ${capas.length} signed off`}
              trend="Sponsor Authorization Required"
              trendDirection="down"
              icon={Crown}
            />
            <MetricCard
              title="21 CFR Part 11 Audit Trail"
              value={`${auditLogs.length} Records`}
              subtitle="Immutable electronic trail"
              trend="Regulatory Inspection Ready"
              trendDirection="up"
              icon={ShieldCheck}
            />
          </>
        ) : (
          /* CRA Default */
          <>
            <MetricCard
              title="Trial Compliance Index"
              value={`${trialMetrics.complianceScore}%`}
              subtitle={`Evaluated across ${trialMetrics.totalPatients} enrolled subjects`}
              trend="Stable across 4 sites"
              trendDirection="up"
              icon={CheckCircle2}
            />
            <MetricCard
              title="Total Deviations Flagged"
              value={openDeviationsCount}
              subtitle={`${criticalCount} Critical • ${majorCount} Major`}
              trend={hasAnalyzed ? `${openDeviationsCount} active issues` : "4 baseline issues"}
              trendDirection={openDeviationsCount > 4 ? "down" : "neutral"}
              icon={AlertTriangle}
            />
            <MetricCard
              title="Highest Risk Site"
              value={highestRiskSite.siteCode}
              subtitle={`${highestRiskSite.siteName} (${highestRiskSite.score}/100)`}
              trend={`Risk Score: ${highestRiskSite.score}/100`}
              trendDirection="down"
              icon={Building2}
            />
            <MetricCard
              title="Subject Retention & Safety"
              value="98.1%"
              subtitle="1 Missed visit • 0 Study withdrawals"
              trend="GCP Safety Target: >95%"
              trendDirection="up"
              icon={ShieldAlert}
            />
          </>
        )}
      </div>

      {/* AI Copilot Executive Synthesis / Role Insights */}
      <div className="p-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 shadow-subtle">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isInvestigator ? "Agentic Copilot Summary — Metro General (Site 03)" : executiveInsight.title}
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  {isInvestigator ? "SITE-03 ADVISORY" : executiveInsight.badge}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Verified against ICH GCP E6(R2) §5.18 & Protocol CT-101
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-700 leading-relaxed font-medium">
              {isInvestigator 
                ? "Metro General (Site 03) has recorded recurrent visit scheduling delays (e.g. PT-1042 Day 20, PT-1043 Day 36) and two prohibited substance occurrences. An automated CAPA (CAPA-2026-001) has been drafted for Principal Investigator response. Immediate patient reassessment is advised for PT-1043."
                : executiveInsight.summary}
            </p>

            <div className="mt-3.5 pt-3 border-t border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Root Cause Driver:</strong> {isInvestigator ? "Coordinator staff turnover and lack of electronic visit window calendar reminders." : executiveInsight.keyDriver}
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Recommended Next Action:</strong> {isInvestigator ? "Submit formal Site Action Plan on CAPA-2026-001 and confirm staff retraining." : executiveInsight.recommendedAction}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Scoped Deviations & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Scoped Priority Deviations Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">
                  {isInvestigator ? "Site 03 Priority Protocol Deviations" : "Priority Deviations Requiring Clinical Review"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isInvestigator 
                    ? "Violations detected among Metro General participants" 
                    : "Ranked by clinical severity and trial integrity impact"}
                </p>
              </div>
              <button
                onClick={() => navigate("/deviations")}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All ({scopedDeviations.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {scopedDeviations.slice(0, 5).map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDeviation(dev)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{dev.id}</span>
                      <SeverityBadge severity={dev.severity} />
                      <span className="text-[11px] font-medium text-slate-500 font-mono">
                        {dev.patientId} • {dev.siteCode || dev.siteId}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-800 truncate">
                      {dev.description || dev.actual || dev.explanation}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {dev.explanationSummary || dev.ruleViolated || dev.expected}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top {Math.min(5, scopedDeviations.length)} of {scopedDeviations.length} scoped deviations</span>
            <span className="font-mono font-bold text-rose-600">
              {criticalCount} Critical Deviations Active
            </span>
          </div>
        </div>

        {/* Right: Site Comparison (for Trial-wide roles) OR Site 03 Deep Dive (for Investigator) (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between">
          {!isInvestigator ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Site Risk Comparison Matrix</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Continuous score (0–100) calculated from patient deviations</p>
                </div>
                <button
                  onClick={() => navigate("/sites")}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>All Sites</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bar Chart of 5 Sites */}
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={siteBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg">
                              <div className="font-bold">{d.name}: {d.fullName}</div>
                              <div className="text-slate-300 mt-1">
                                Risk Score: <span className="font-bold text-amber-400">{d.score}/100</span>
                              </div>
                              <div className="text-slate-300">Band: {d.band}</div>
                              <div className="text-slate-300">Deviations: {d.deviations}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#2563eb" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Site 03 Patient Adherence Breakdown</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Patient safety compliance at Metro General</p>
                </div>
                <RoleBadge role={user.role} assignedSite={user.assignedSite} size="sm" />
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900 mb-1">
                    <span>Critical Safety Flags</span>
                    <span className="font-mono">2 Participants</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    PT-1043 (Prohibited CYP3A4 inhibitor Drug-X) & PT-1051 (200mg dose breach).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
                    <span>Visit Window Lapses</span>
                    <span className="font-mono">3 Participants</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    PT-1042 (Day 20, +6d late), PT-1045 (Day 38, +5d late), PT-1055 (Day 19, +2d late).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1">
                    <span>Laboratory Adherence</span>
                    <span className="font-mono">3 Missing CBCs</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Central lab data coordinator alerted for PT-1046, PT-1048, and PT-1050.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Protocol v3.2 Engine</span>
            <span className="font-semibold text-slate-700">21 CFR 312 Scoped</span>
          </div>
        </div>
      </div>

      {/* Drawers */}
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
        onSelectDeviation={(d) => {
          setSelectedPatientId(null);
          setSelectedDeviation(d);
        }}
      />
    </div>
  );
}
