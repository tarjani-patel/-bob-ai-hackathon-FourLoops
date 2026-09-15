import React, { useState, useEffect } from "react";
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
  Check,
  Crown,
  Lock,
  Search,
  ExternalLink
} from "lucide-react";
import { useTrial } from "../context/TrialContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { ROLE_CONFIG } from "../auth/roleConfig.js";
import { RoleBadge } from "../auth/RoleBadge.jsx";
import { useLocation } from "react-router-dom";

const SECTIONS = [
  { id: "profile", name: "Profile", icon: User },
  { id: "trial", name: "Trial Settings", icon: Sliders },
  { id: "users", name: "Users & Access (RBAC)", icon: Users },
  { id: "audit", name: "Audit Trail (21 CFR Part 11)", icon: FileText },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "integrations", name: "Integrations", icon: Link },
  { id: "preferences", name: "Preferences", icon: SlidersHorizontal },
  { id: "privacy", name: "Data & Privacy", icon: Shield },
];

export function SettingsPage() {
  const { protocol, auditLogs, logAuditEvent } = useTrial();
  const { user, getStoredUsers } = useAuth();
  const location = useLocation();

  const storedAccounts = getStoredUsers ? getStoredUsers() : [];
  const [activeTab, setActiveTab] = useState("users");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");

  // Check URL query parameters for default tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && SECTIONS.some((s) => s.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

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

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    if (logAuditEvent) {
      logAuditEvent({
        action: "PROTOCOL_TOLERANCES_UPDATED",
        entityType: "SETTINGS",
        entityId: "CT-101",
        details: `Study Manager updated window tolerances (V1: ±${v1Window}d, V2: ±${v2Window}d, V3: ±${v3Window}d) and dose rules.`,
        performedBy: user?.name || "Elena Rostova",
        role: user?.role || "SPONSOR"
      });
    }
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.id.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.performedBy.toLowerCase().includes(q) ||
      log.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              System Settings & Study Governance
            </h1>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Sponsor / Study Manager Access
            </span>
            <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure compliance engine tolerances, inspect the 21 CFR Part 11 audit log, and manage clinical role privileges.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Settings saved and logged to audit trail</span>
          </div>
        )}
      </div>

      {/* Main Settings Layout */}
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
                    ? "bg-blue-50 text-blue-800 font-bold border border-blue-200 shadow-xs"
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
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 p-6 shadow-subtle min-h-[500px]">
          
          {/* USERS & ACCESS (RBAC) */}
          {activeTab === "users" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Role-Based Access Control (RBAC) Roster
                  </h2>
                  <p className="text-slate-500 mt-0.5">
                    Configured roles, permissions, and site data scoping boundaries for Study CT-101.
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-400">{storedAccounts.length} Configured Accounts</span>
              </div>

              <div className="space-y-3">
                {storedAccounts.map((acc) => {
                  const isCurrent = user?.email?.toLowerCase() === acc.email?.toLowerCase();
                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent 
                          ? "bg-blue-50/50 border-blue-300 ring-1 ring-blue-300" 
                          : "bg-slate-50/50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{acc.name}</span>
                            <RoleBadge role={acc.role} assignedSite={acc.assignedSite} size="sm" />
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.2 rounded">
                                ACTIVE SESSION
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5 font-medium">
                            {acc.email} • {acc.organization}
                          </div>
                          <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
                            {acc.roleDescription}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-3">
                          <span>Allowed Routes: <strong>{acc.allowedRoutes.length} of 8</strong></span>
                          <span>Permissions: <strong>{acc.permissions.length} granular rules</strong></span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          Scope: {acc.assignedSite ? `Strictly ${acc.assignedSite}` : "Trial-wide (5 Sites)"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUDIT TRAIL (21 CFR Part 11) */}
          {activeTab === "audit" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Electronic Audit Trail (21 CFR Part 11 Compliant)
                  </h2>
                  <p className="text-slate-500 mt-0.5">
                    Immutable, time-stamped log of authentication, analysis runs, data mutations, and CAPA sign-offs.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                  {auditLogs.length} Records Logged
                </span>
              </div>

              {/* Search within Audit Logs */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter audit entries by action, user, or details..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Audit Records Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-semibold text-slate-600 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Log ID</th>
                        <th className="py-2.5 px-3">Timestamp (UTC)</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Performed By</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {filteredAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                            {log.id}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                            {log.timestamp}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-sans font-bold text-blue-800">
                            {log.action}
                          </td>
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-800 whitespace-nowrap">
                            {log.performedBy}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                            <RoleBadge role={log.role} size="sm" />
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-700 max-w-sm truncate text-[11px]">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TRIAL SETTINGS */}
          {activeTab === "trial" && (
            <form onSubmit={handleSave} className="space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Protocol Thresholds & Tolerances</h2>
                <p className="text-slate-500 mt-0.5">Parameters verified by deterministic compliance rules</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Visit Window Allowances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-slate-600 font-medium mb-1">Visit 1 (Day 1 Baseline)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">±</span>
                      <input
                        type="number"
                        value={v1Window}
                        onChange={(e) => setV1Window(Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-300 rounded font-mono text-center font-bold"
                      />
                      <span className="text-slate-500">days</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-slate-600 font-medium mb-1">Visit 2 (Day 14 Safety)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">±</span>
                      <input
                        type="number"
                        value={v2Window}
                        onChange={(e) => setV2Window(Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-300 rounded font-mono text-center font-bold"
                      />
                      <span className="text-slate-500">days</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-slate-600 font-medium mb-1">Visit 3 (Day 28 Primary)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">±</span>
                      <input
                        type="number"
                        value={v3Window}
                        onChange={(e) => setV3Window(Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-300 rounded font-mono text-center font-bold"
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
                  <span>Save Tolerances to Audit Log</span>
                </button>
              </div>
            </form>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Current User Session</h2>
                <p className="text-slate-500 mt-0.5">Verified credentials for Study CT-101</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-bold text-slate-900">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-mono text-slate-800">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Role</span>
                  <RoleBadge role={user?.role} assignedSite={user?.assignedSite} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Organization</span>
                  <span className="font-medium text-slate-800">{user?.organization}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Site Scope</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {user?.assignedSite ? user.assignedSite : "Global / Trial-wide"}
                  </span>
                </div>
              </div>
            </div>
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

          {/* INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Clinical Data Pipelines & Connectors</h2>
                <p className="text-slate-500 mt-0.5">Interoperability with EDC, CTMS, eSource, and IBM watsonx.ai</p>
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

          {/* PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">User Interface & Auditing Preferences</h2>
                <p className="text-slate-500 mt-0.5">Display formatting and regional regulatory settings</p>
              </div>
              <p className="text-slate-600">
                Default regulatory standard: <strong>ICH GCP E6(R2) / FDA 21 CFR Part 11</strong>. Timezone: <strong>UTC</strong>.
              </p>
            </div>
          )}

          {/* DATA & PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Data Segregation & HIPAA Privacy Controls</h2>
                <p className="text-slate-500 mt-0.5">De-identification standards and investigator data shielding</p>
              </div>
              <p className="text-slate-600 leading-relaxed">
                All patient records are pseudonymized with cryptographic subject IDs (e.g. PT-1042). Site investigators are strictly restricted to their designated investigative site via cryptographic token scope isolation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
