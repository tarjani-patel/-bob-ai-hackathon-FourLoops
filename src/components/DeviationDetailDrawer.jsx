import React, { useState, useEffect } from "react";
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  User, 
  Building2, 
  FileCheck, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Stethoscope,
  Sparkles,
  Loader2,
  Info
} from "lucide-react";
import { SeverityBadge, RiskBadge } from "./RiskBadge.jsx";
import { generateDeviationExplanation } from "../logic/explanationEngine.js";
import { explainDeviationWithAI } from "../api/trialApi.js";
import { useNavigate } from "react-router-dom";

export function DeviationDetailDrawer({ deviation, onClose, onSelectPatient }) {
  const navigate = useNavigate();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    setAiExplanation(null);
    setAiError(null);
    setAiLoading(false);
  }, [deviation?.id]);

  if (!deviation) return null;

  const explanation = generateDeviationExplanation(deviation);

  const handleExplainWithAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await explainDeviationWithAI({
        deviationId: deviation.id,
        patientId: deviation.patientId,
        siteId: deviation.siteId,
        siteName: deviation.siteName,
        category: deviation.category,
        type: deviation.type,
        severity: deviation.severity,
        expected: deviation.expected,
        actual: deviation.actual,
        evidence: deviation.evidence || deviation.explanation
      });
      setAiExplanation(res);
    } catch (err) {
      console.warn("AI deviation explanation failed:", err);
      setAiError(err.message || "IBM Granite AI service is currently unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-fade animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {deviation.id}
              </span>
              <SeverityBadge severity={deviation.severity} showWeight={true} />
              <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                Status: {deviation.status}
              </span>
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-900 tracking-tight">
              {deviation.category} Discrepancy
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detected on {new Date(deviation.detectedAt).toLocaleDateString()} • Type: <span className="font-mono text-slate-700">{deviation.type}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ============================================================ */}
          {/* HERO ELEMENT: PROTOCOL REQUIREMENT vs. ACTUAL PATIENT DATA   */}
          {/* ============================================================ */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-blue-200/60 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-700" />
                Deterministic Verification Benchmark
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                Rule Check
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Protocol Requirement Block */}
              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Protocol Requirement (Expected)
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-900 leading-relaxed pl-4 border-l-2 border-emerald-400 font-mono bg-white/70 py-1.5 px-2 rounded">
                  {deviation.expected}
                </div>
              </div>

              {/* Actual Patient Data Block */}
              <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Actual Patient Data (Observed)
                </div>
                <div className="mt-2 text-xs font-semibold text-rose-950 leading-relaxed pl-4 border-l-2 border-rose-400 font-mono bg-white/70 py-1.5 px-2 rounded">
                  {deviation.actual}
                </div>
              </div>
            </div>
          </div>

          {/* Context & Metadata Row */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Affected Patient</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">{deviation.patientId}</span>
                {onSelectPatient && (
                  <button 
                    onClick={() => onSelectPatient(deviation.patientId)}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    View Chart →
                  </button>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Investigation Site</span>
              <div className="mt-1 font-semibold text-slate-900 truncate">
                {deviation.siteName} ({deviation.siteId})
              </div>
            </div>
          </div>

          {/* Clinical Rationale & Root Cause */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-slate-700" />
              Clinical & Regulatory Rationale
            </h3>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div>
                <span className="font-semibold text-slate-800">What Happened:</span>
                <p className="mt-0.5 text-slate-600 leading-relaxed">{deviation.explanation}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="font-semibold text-slate-800">Why It Matters (Clinical Significance):</span>
                <p className="mt-0.5 text-slate-600 leading-relaxed">{explanation.clinicalSignificance}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="font-semibold text-slate-800">Regulatory Impact:</span>
                <div className="mt-1 inline-block text-[11px] font-mono text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded">
                  {explanation.regulatoryImpact}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* IBM watsonx.ai Granite Clinical Interpretation Copilot       */}
          {/* ============================================================ */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-purple-50/20 to-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                  IBM Granite Clinical Assistant
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                ibm/granite-3-8b-instruct
              </span>
            </div>

            {!aiExplanation && !aiLoading && !aiError && (
              <div className="p-3 bg-white rounded-lg border border-indigo-100 flex items-center justify-between gap-3 text-xs">
                <p className="text-slate-600">
                  Generate deep clinical context, contributing factors, and regulatory nuances powered by IBM watsonx.ai.
                </p>
                <button
                  onClick={handleExplainWithAI}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain with AI</span>
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="p-4 bg-white rounded-lg border border-indigo-100 flex items-center justify-center gap-3 text-xs text-indigo-800">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="font-medium">Synthesizing clinical trial context with IBM Granite...</span>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>AI service offline. Deterministic compliance verification remains authoritative.</span>
                </div>
                <button
                  onClick={handleExplainWithAI}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {aiExplanation && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-indigo-100 space-y-2">
                  <div className="font-semibold text-indigo-950">AI Clinical Interpretation:</div>
                  <p className="text-slate-700 leading-relaxed">{aiExplanation.explanation}</p>

                  {aiExplanation.likelyContributingFactors?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="font-semibold text-slate-800 mb-1">Likely Contributing Factors:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        {aiExplanation.likelyContributingFactors.map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiExplanation.clinicalImpact && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-800">Clinical & Safety Impact: </span>
                      <span className="text-slate-600">{aiExplanation.clinicalImpact}</span>
                    </div>
                  )}

                  {aiExplanation.limitations && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                      <span className="font-medium not-italic text-slate-700">Nuance / Limitation: </span>
                      {aiExplanation.limitations}
                    </div>
                  )}
                </div>

                <div className="p-2 bg-indigo-50/50 rounded border border-indigo-100 text-[10px] text-indigo-900 leading-tight">
                  <span className="font-semibold">Notice:</span> {aiExplanation.humanReviewNotice}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Action */}
          <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Recommended Corrective Action
            </h3>
            <p className="mt-2 text-xs text-amber-950 leading-relaxed">
              {deviation.recommendedAction}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              navigate("/capa");
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span>Inspect Linked CAPA</span>
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
