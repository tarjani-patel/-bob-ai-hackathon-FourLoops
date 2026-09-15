import React, { useState } from "react";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  FileCheck,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { useTrial } from "../context/TrialContext.jsx";
import { RiskBadge, SeverityBadge } from "../components/RiskBadge.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { RoleBadge } from "../auth/RoleBadge.jsx";

const REPORT_TEMPLATES = [
  {
    id: "REP-01",
    name: "Protocol Compliance Master Report",
    category: "Protocol Compliance Report",
    type: "Regulatory Compliance Audit",
    frequency: "Monthly",
    lastGenerated: "2026-02-15",
    status: "Verified",
    description: "Trial-wide evaluation of subject visit windows, dosing adherence, and mandatory procedures against Protocol v3.2."
  },
  {
    id: "REP-02",
    name: "Deviation Summary & Root Cause Register",
    category: "Deviation Summary",
    type: "Clinical Safety & QA",
    frequency: "Bi-Weekly",
    lastGenerated: "2026-02-14",
    status: "Verified",
    description: "Comprehensive breakdown of all detected protocol deviations categorized by severity weights and root-cause hypotheses."
  },
  {
    id: "REP-03",
    name: "Site Risk & Targeted Monitoring Index",
    category: "Site Risk Report",
    type: "Risk-Based Monitoring (RBM)",
    frequency: "Weekly",
    lastGenerated: "2026-02-15",
    status: "Action Required",
    description: "Multi-site ranking and 30-day forecast identifying operational risks, high-risk centers, and CRA intervention priorities."
  },
  {
    id: "REP-04",
    name: "Corrective and Preventive Action (CAPA) Log",
    category: "CAPA Report",
    type: "GCP Compliance Oversight",
    frequency: "Continuous",
    lastGenerated: "2026-02-13",
    status: "Review Pending",
    description: "Formal CAPA tracking register with problem statements, objective evidence, PI owners, and implementation milestones."
  }
];

export function ReportsPage() {
  const { trialMetrics, siteRisks, deviations, protocol, capas } = useTrial();
  const { user } = useAuth();
  const [selectedReportId, setSelectedReportId] = useState("REP-01");

  const activeReport = REPORT_TEMPLATES.find((r) => r.id === selectedReportId) || REPORT_TEMPLATES[0];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Compliance Reports</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Audit-Ready Documentation
            </span>
            <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Automated regulatory reporting generated directly from deterministic trial compliance facts and risk calculations. Suitable for IRB submissions, sponsor audits, and FDA inspections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={() => alert(`Report "${activeReport.name}" exported as PDF with digital signature.`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Report PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Catalog, Right Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Report Templates & Registers ({REPORT_TEMPLATES.length})
          </h2>

          <div className="space-y-2.5">
            {REPORT_TEMPLATES.map((report) => {
              const isSelected = report.id === selectedReportId;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-100"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-subtle"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {report.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      report.status === "Action Required"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : report.status === "Review Pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-slate-900 leading-snug">
                    {report.name}
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{report.category}</span>
                    <span>{report.lastGenerated}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Report Preview Area (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-8 shadow-subtle space-y-6">
          {/* Report Document Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Official Clinical Trial Regulatory Document
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {activeReport.name}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Protocol: <strong className="font-mono">{protocol.trialId}</strong> ({protocol.trialName}) • Version {protocol.protocolVersion}
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <div className="font-mono text-[11px]">DOC REF: {activeReport.id}-2026-Q1</div>
                <div>Date: {activeReport.lastGenerated}</div>
                <div className="text-emerald-700 font-semibold mt-1">Status: {activeReport.status}</div>
              </div>
            </div>
          </div>

          {/* Report Summary Callout */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs leading-relaxed space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
              Executive Summary & Audit Scope
            </h3>
            <p className="text-slate-700">
              This report compiles data for {trialMetrics.totalPatients} randomized subjects across 5 investigation sites. The TrialGuard deterministic engine conducted systematic rules verification against protocol-defined visit intervals, investigational drug accountability, concomitant medication proscriptions, and mandatory safety blood panels.
            </p>
            <div className="pt-2 flex items-center gap-4 text-[11px]">
              <div><strong>Trial Compliance:</strong> <span className="font-mono text-emerald-700">{trialMetrics.compliancePercentage}%</span></div>
              <div><strong>Total Deviations:</strong> <span className="font-mono text-rose-700">{deviations.length}</span></div>
              <div><strong>High Risk Sites:</strong> <span className="font-mono text-rose-700">{trialMetrics.highRiskSitesCount}</span></div>
              <div><strong>Open CAPAs:</strong> <span className="font-mono text-amber-700">{capas.length}</span></div>
            </div>
          </div>

          {/* Conditional Preview Content based on selected report */}
          {selectedReportId === "REP-01" && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">1. Schedule of Assessment Adherence</h3>
              <table className="w-full border-collapse border border-slate-200 text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200">Visit Interval</th>
                    <th className="p-2.5 border-r border-slate-200">Window Limit</th>
                    <th className="p-2.5 border-r border-slate-200">Total Conducted</th>
                    <th className="p-2.5">Compliant Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 border-r border-slate-200 font-medium">Visit 1 (Baseline)</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono">Day 1 ± 3d</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono">104 / 104</td>
                    <td className="p-2.5 font-mono text-emerald-700 font-bold">98.1%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border-r border-slate-200 font-medium">Visit 2 (Intermediate)</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono">Day 14 ± 3d</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono">103 / 104</td>
                    <td className="p-2.5 font-mono text-amber-700 font-bold">92.3%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border-r border-slate-200 font-medium">Visit 3 (Primary Safety)</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono">Day 28 ± 5d</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono">102 / 104</td>
                    <td className="p-2.5 font-mono text-amber-700 font-bold">89.4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {selectedReportId === "REP-02" && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">1. Deviation Severity Distribution</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200">
                  <div className="font-bold text-rose-800 text-base font-mono">{deviations.filter(d => d.severity === 'Critical').length}</div>
                  <div className="text-[10px] text-rose-700 font-medium">Critical (15 pts)</div>
                </div>
                <div className="p-2.5 rounded bg-orange-50 border border-orange-200">
                  <div className="font-bold text-orange-800 text-base font-mono">{deviations.filter(d => d.severity === 'Major').length}</div>
                  <div className="text-[10px] text-orange-700 font-medium">Major (10 pts)</div>
                </div>
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200">
                  <div className="font-bold text-amber-800 text-base font-mono">{deviations.filter(d => d.severity === 'Minor').length}</div>
                  <div className="text-[10px] text-amber-700 font-medium">Minor (4 pts)</div>
                </div>
                <div className="p-2.5 rounded bg-slate-100 border border-slate-200">
                  <div className="font-bold text-slate-800 text-base font-mono">{deviations.filter(d => d.severity === 'Administrative').length}</div>
                  <div className="text-[10px] text-slate-600 font-medium">Administrative (1 pt)</div>
                </div>
              </div>
            </div>
          )}

          {selectedReportId === "REP-03" && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">1. Investigation Center Risk Rankings</h3>
              <div className="space-y-2">
                {siteRisks.map((s, idx) => (
                  <div key={s.siteId} className="p-3 rounded border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-900">#{idx + 1} {s.siteCode}</span>
                      <span className="text-slate-600 ml-2">{s.siteName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">{s.score}/100</span>
                      <RiskBadge band={s.riskBand} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReportId === "REP-04" && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">1. Open CAPA Audit Register</h3>
              <div className="space-y-2">
                {capas.map((c) => (
                  <div key={c.id} className="p-3 rounded border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-700">{c.id}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Human Review Required
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 mt-1">{c.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Owner: {c.owner} • Site: {c.siteName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regulatory Attestation Sign-off Block */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Auditor Attestation:</span>
              <p className="mt-1 leading-relaxed text-[11px]">
                I verify that the compliance facts detailed herein represent objective deterministic calculations evaluated in compliance with ICH GCP E6(R2) Section 5.18.
              </p>
              <div className="mt-3 font-semibold text-slate-800">
                Dr. Alex Mercer, MD, CCRA<br />
                <span className="text-slate-400 text-[10px]">Lead Clinical Trial Compliance Officer</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Digital Signature:</span>
              <div className="mt-1 font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-200 text-slate-700 break-all">
                SHA256: 9e4f2b9881e4b3c9a17e0892ffac810b429d5b4009214713c7dae
              </div>
              <div className="mt-2 text-[10px] text-slate-400">Timestamp: 2026-02-15 12:00:00 UTC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
