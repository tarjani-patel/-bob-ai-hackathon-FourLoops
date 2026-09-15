import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Sliders, 
  Bell, 
  Users, 
  Link, 
  FileText, 
  SlidersHorizontal, 
  Monitor, 
  Shield, 
  CheckCircle2, 
  RotateCw,
  Save,
  Check
} from "lucide-react";
import { useTrial } from "../context/TrialContext.jsx";

const SECTIONS = [
  { id: "profile", name: "Profile", icon: User },
  { id: "trial", name: "Trial Settings", icon: Sliders },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "users", name: "Users & Access", icon: Users },
  { id: "integrations", name: "Integrations", icon: Link },
  { id: "audit", name: "Audit Logs", icon: FileText },
  { id: "preferences", name: "Preferences", icon: SlidersHorizontal },
  { id: "display", name: "Display", icon: Monitor },
  { id: "privacy", name: "Data & Privacy", icon: Shield },
];

export function SettingsPage() {
  const { protocol } = useTrial();
  const [activeTab, setActiveTab] = useState("trial");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states for trial settings
  const [v1Window, setV1Window] = useState(3);
  const [v2Window, setV2Window] = useState(3);
  const [v3Window, setV3Window] = useState(5);
  const [targetDose, setTargetDose] = useState(100);
  const [autoFlagProhibited, setAutoFlagProhibited] = useState(true);
  const [requireCbcBeforeV3, setRequireCbcBeforeV3] = useState(true);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsCriticalAlerts, setSmsCriticalAlerts] = useState(true);
  const [inAppSound, setInAppSound] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure compliance engine tolerances, integration webhooks, audit trails, and notification thresholds.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Settings saved to trial profile</span>
          </div>
        )}
      </div>

      {/* Main Settings Layout: Left Nav, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-2 shadow-subtle space-y-1">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = sec.id === activeTab;

            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-800 font-bold border border-blue-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
                <span>{sec.name}</span>
              </button>
            );
          })}
        </div>

        {/* Setting Content Panel (9 cols) */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">User Profile & Investigator Credentials</h2>
                <p className="text-slate-500 mt-0.5">Your authenticated identity and role permissions</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-lg font-bold text-slate-700">
                  AM
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dr. Alex Mercer, MD, CCRA</h3>
                  <p className="text-slate-500">Lead Clinical Research Associate & Trial Auditor</p>
                  <span className="inline-block mt-1 text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ID: CRA-USER-88412
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value="alex.mercer@clinicaltrials.org"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Assigned Study</label>
                  <input
                    type="text"
                    disabled
                    value="CT-101 (Cardio-X Phase III)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TRIAL SETTINGS */}
          {activeTab === "trial" && (
            <form onSubmit={handleSave} className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Deterministic Protocol Rules & Tolerances</h2>
                <p className="text-slate-500 mt-0.5">
                  Parameters used by the compliance engine to detect visit deviations, dosing faults, and lab omissions
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Visit Window Tolerances (Days)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Visit 1 (Baseline Day 1)</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">±</span>
                      <input
                        type="number"
                        value={v1Window}
                        onChange={(e) => setV1Window(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 border border-slate-300 rounded font-mono text-center font-bold"
                      />
                      <span className="text-slate-500">days</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Visit 2 (Day 14)</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">±</span>
                      <input
                        type="number"
                        value={v2Window}
                        onChange={(e) => setV2Window(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 border border-slate-300 rounded font-mono text-center font-bold"
                      />
                      <span className="text-slate-500">days</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Visit 3 (Day 28)</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">±</span>
                      <input
                        type="number"
                        value={v3Window}
                        onChange={(e) => setV3Window(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 border border-slate-300 rounded font-mono text-center font-bold"
                      />
                      <span className="text-slate-500">days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Investigational Dosing Adherence</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Target Cardio-X Dose</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={targetDose}
                        onChange={(e) => setTargetDose(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 border border-slate-300 rounded font-mono text-center font-bold"
                      />
                      <span className="text-slate-500">mg once daily (QD)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Automated Enforcement Switches</h3>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFlagProhibited}
                    onChange={(e) => setAutoFlagProhibited(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">Strict Prohibited Medication Screening</span>
                    <p className="text-slate-500 text-[11px]">Automatically raise Critical deviation on detection of Drug-X or CYP3A4 inhibitors.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireCbcBeforeV3}
                    onChange={(e) => setRequireCbcBeforeV3(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">Mandatory CBC Before Visit 3 Gate</span>
                    <p className="text-slate-500 text-[11px]">Raise Major deviation if Complete Blood Count is absent prior to primary efficacy endpoint visit.</p>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Protocol Tolerances</span>
                </button>
              </div>
            </form>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Alert Dispatch Settings</h2>
                <p className="text-slate-500 mt-0.5">Manage automated notification triggers and alert thresholds</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800">Email Digest for High-Risk Site Alerts</span>
                    <p className="text-slate-500 text-[11px]">Send immediate notification when a clinical site enters the High Risk band (&gt;60/100).</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800">SMS / Pager Emergency Alerts for Critical Violations</span>
                    <p className="text-slate-500 text-[11px]">Direct page to Medical Monitor upon detection of prohibited Drug-X or dosing anomalies.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsCriticalAlerts}
                    onChange={(e) => setSmsCriticalAlerts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* USERS & ACCESS */}
          {activeTab === "users" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">User Access & Role-Based Permissions</h2>
                <p className="text-slate-500 mt-0.5">Active clinical research coordinators and auditors on CT-101</p>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Dr. Alex Mercer", role: "Lead CRA / Compliance Auditor", email: "alex.mercer@clinicaltrials.org", status: "Active" },
                  { name: "Dr. Evelyn Zhao", role: "Principal Investigator (Site 03)", email: "evelyn.zhao@metrohealth.edu", status: "Active" },
                  { name: "Sarah Lin", role: "Site Coordinator (Site 01)", email: "lin.sarah@mayo.edu", status: "Active" },
                  { name: "James Taylor", role: "Site Coordinator (Site 03)", email: "jtaylor@metrohealth.edu", status: "Active" }
                ].map((u, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-500">{u.role} • {u.email}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Clinical Data Pipelines & AI Connectors</h2>
                <p className="text-slate-500 mt-0.5">Seamless interoperability with EDC, CTMS, eSource, and IBM watsonx.ai</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Medidata Rave / Veeva EDC Connector", status: "Connected (Mock)", desc: "Continuous subject visit, procedure, and eCRF data ingestion." },
                  { name: "Central Laboratory LIMS / HL7 Feed", status: "Connected (Mock)", desc: "Real-time CBC and cardiac biomarker result ingestion." },
                  { name: "IBM watsonx.ai Copilot Bridge", status: "Ready for Connection", desc: "Enterprise foundation model for regulatory draft summaries and CAPA reasoning." }
                ].map((conn, i) => (
                  <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{conn.name}</div>
                      <p className="text-slate-500 mt-0.5">{conn.desc}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700">
                      {conn.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === "audit" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">21 CFR Part 11 Audit Trail</h2>
                <p className="text-slate-500 mt-0.5">Immutable audit event log of rule executions and review activities</p>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                {[
                  { time: "2026-02-15 12:00:02 UTC", user: "SYSTEM", action: "Compliance Engine Run completed: 29 deviations calculated" },
                  { time: "2026-02-15 11:45:10 UTC", user: "Dr. Alex Mercer", action: "Viewed Hero Comparison for DEV-2026-006 (PT-1042)" },
                  { time: "2026-02-15 11:30:22 UTC", user: "SYSTEM", action: "Site 03 Risk Escalated to High (73/100)" },
                  { time: "2026-02-15 10:15:00 UTC", user: "Sarah Lin", action: "Submitted query response for Site 01 protocol procedure" }
                ].map((log, i) => (
                  <div key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="text-blue-700 font-bold">[{log.user}]</span>
                    <span className="text-slate-800 flex-1 ml-3 truncate">{log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Auditor Preferences</h2>
                <p className="text-slate-500 mt-0.5">Workspace locale, timezones, and report generation defaults</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Reporting Time Zone</label>
                  <select className="px-3 py-1.5 border border-slate-300 rounded text-slate-800 bg-white">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>US/Eastern (EST/EDT)</option>
                    <option>US/Central (CST/CDT)</option>
                    <option>US/Pacific (PST/PDT)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* DISPLAY */}
          {activeTab === "display" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Display & Visual Presentation</h2>
                <p className="text-slate-500 mt-0.5">High-contrast clinical accessibility themes</p>
              </div>
              <p className="text-slate-600">
                TrialGuard AI is formatted in high-legibility enterprise clinical blue with calm neutral backgrounds and WCAG AA contrast for medical audits.
              </p>
            </div>
          )}

          {/* DATA & PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Data Integrity, HIPAA & GDPR Compliance</h2>
                <p className="text-slate-500 mt-0.5">Subject de-identification safeguards</p>
              </div>
              <p className="text-slate-600 leading-relaxed">
                All subject identifiers are strictly pseudonymized (e.g., PT-1042). No Protected Health Information (PHI) or Personally Identifiable Information (PII) is transmitted outside local secure execution boundaries. Compliant with HIPAA Safe Harbor and GDPR Article 89(1).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
