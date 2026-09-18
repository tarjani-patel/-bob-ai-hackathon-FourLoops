import React, { useState } from "react";
import { 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Pill, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink,
  BookOpen,
  FlaskConical,
  Activity,
  FileCheck
} from "lucide-react";
import { useTrial } from "../context/TrialContext.jsx";
import { PROTOCOL_CONFIG } from "../data/protocolConfig.js";

export function ProtocolPage() {
  const { protocol, trialMetrics, deviations } = useTrial();
  const [activeTab, setActiveTab] = useState("rules");

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="prohealth-card bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-xs">
              {protocol.trialId}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Protocol Version: {protocol.protocolVersion}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              IRB Approved: {protocol.irbApprovalNumber}
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {protocol.trialName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {protocol.indication} • Sponsor: {protocol.sponsor} • Last amended: {protocol.lastAmendmentDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Protocol v3.2 Master Specification downloaded in PDF format.")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 text-xs font-bold shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Protocol PDF</span>
          </button>
        </div>
      </div>

      {/* Trial Metadata Overview Bar */}
      <div className="prohealth-card grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-blue-100 p-5 shadow-glass text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phase</span>
          <div className="mt-1 font-extrabold text-slate-900 text-base">{protocol.phase}</div>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Investigation Sites</span>
          <div className="mt-1 font-extrabold text-slate-900 text-base">{protocol.sites.length} Sites</div>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Cohort</span>
          <div className="mt-1 font-extrabold text-slate-900 text-base">{protocol.targetEnrollment} Subjects</div>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trial Compliance Rate</span>
          <div className="mt-1 font-extrabold text-emerald-600 text-base font-mono">{trialMetrics.compliancePercentage}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === "rules"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Deterministic Protocol Rules ({protocol.visits.length + 3})</span>
        </button>

        <button
          onClick={() => setActiveTab("compliance")}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === "compliance"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Protocol Compliance Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === "documents"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Protocol Documents & Manuals (3)</span>
        </button>
      </div>

      {/* TAB CONTENT: RULES */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          {/* Section 1: Study Visits & Tolerances */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">
                  Study Visits & Schedule of Assessments
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Section 4.1 Window Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {protocol.visits.map((v) => (
                <div key={v.visitNumber} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900 font-mono">
                      Visit {v.visitNumber}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      Day {v.targetDay}
                    </span>
                  </div>
                  <h3 className="mt-1 font-bold text-xs text-slate-800">{v.name}</h3>

                  <div className="mt-2.5 p-2 rounded bg-white border border-slate-200 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Protocol Window</span>
                    <div className="font-bold text-slate-900 font-mono text-xs mt-0.5">
                      {v.windowDescription}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Required Procedures:</span>
                    <ul className="mt-1 space-y-1 text-xs text-slate-600">
                      {v.requiredProcedures.map((proc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                          <span>{proc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Investigational Product & Prohibited Medications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* IP Dosing Rules */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">
                  Investigational Product (IP) Dosing Specification
                </h2>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Compound Name:</span>
                  <span className="font-bold text-slate-900 font-mono">{protocol.investigationalProduct.name} ({protocol.investigationalProduct.code})</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Mandated Dose:</span>
                  <span className="font-bold text-blue-700 font-mono">{protocol.investigationalProduct.targetDoseMg} mg</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Regimen & Route:</span>
                  <span className="font-medium text-slate-900">{protocol.investigationalProduct.frequency}, {protocol.investigationalProduct.route}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Adherence Tolerance:</span>
                  <span className="font-mono text-slate-800">95% – 105% accountability</span>
                </div>
              </div>
            </div>

            {/* Prohibited Concomitant Medications */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
              <div className="flex items-center gap-2 mb-4">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Prohibited Concomitant Medications (Section 5.3)
                </h2>
              </div>

              <div className="space-y-2.5">
                {protocol.prohibitedMedications.map((pm, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 font-mono">{pm.name}</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        {pm.severity} Violation
                      </span>
                    </div>
                    <div className="mt-0.5 text-slate-500 text-[11px] font-medium">{pm.genericClass}</div>
                    <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">{pm.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Mandatory Safety Labs */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-5 h-5 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Mandatory Safety Laboratory Safeguards (Section 6.2)
              </h2>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="font-bold text-slate-900">Complete Blood Count (CBC) with Differential</span>
                <span className="text-slate-500">— Must be collected prior to or at Visit 3 (Day 28).</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-4">
                Enforced by the compliance engine to ensure hematopoietic stability before primary endpoint verification. Any missing CBC panel at Visit 3 is categorized as a Major deviation (+10 points) triggering lab requisition review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMPLIANCE OVERVIEW */}
      {activeTab === "compliance" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Compliance Engine Scoring Topology</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocol verification weights and escalation thresholds defined in the study audit specification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
              <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">Critical Severity</div>
              <div className="mt-1 text-2xl font-bold font-mono text-rose-900">15 Pts</div>
              <p className="mt-1 text-rose-800 text-[11px]">Prohibited meds, Missed visits, Gross dosing errors</p>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-[11px] font-bold text-orange-800 uppercase tracking-wide">Major Severity</div>
              <div className="mt-1 text-2xl font-bold font-mono text-orange-900">10 Pts</div>
              <p className="mt-1 text-orange-800 text-[11px]">Visit window exceeded (late), Missing mandatory CBC</p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Minor Severity</div>
              <div className="mt-1 text-2xl font-bold font-mono text-amber-900">4 Pts</div>
              <p className="mt-1 text-amber-800 text-[11px]">Early visit window, Non-critical test omissions</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Administrative</div>
              <div className="mt-1 text-2xl font-bold font-mono text-slate-900">1 Pt</div>
              <p className="mt-1 text-slate-600 text-[11px]">eCRF data entry delays, minor formatting notes</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-800">Recurrent Risk Modifiers:</h3>
            <ul className="mt-2 space-y-1 text-slate-600 list-disc list-inside">
              <li><span className="font-semibold text-slate-800">Repeated Deviation Modifier (+5 pts):</span> Triggered when an individual participant records &gt; 1 protocol violation.</li>
              <li><span className="font-semibold text-slate-800">Multiple Category Modifier (+5 pts):</span> Triggered when an individual participant records violations across &gt; 1 distinct category.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Master Protocol Repository</h2>
            <p className="text-xs text-slate-500 mt-0.5">Approved regulatory documentation and operational manuals</p>
          </div>

          <div className="space-y-3">
            {[
              { name: "Clinical Study Protocol CT-101 (v3.2 Final Amendment)", size: "4.8 MB", date: "2026-01-15", code: "PROT-CT101-V3.2" },
              { name: "Investigator's Brochure (IB) — Cardio-X 9th Edition", size: "12.1 MB", date: "2025-11-20", code: "IB-BC4089-ED9" },
              { name: "Central Laboratory Operations Manual & Requisition Kit Guide", size: "3.2 MB", date: "2026-01-05", code: "LAB-MAN-2026" }
            ].map((doc, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 flex items-center justify-between text-xs transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <div>
                    <h3 className="font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-slate-500 mt-0.5">{doc.code} • {doc.size} • Last updated {doc.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Downloading verified copy of ${doc.name}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
