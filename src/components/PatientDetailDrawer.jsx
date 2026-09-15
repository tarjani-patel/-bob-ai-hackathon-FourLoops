import React, { useState } from "react";
import { 
  X, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Pill, 
  TestTube, 
  Activity, 
  ChevronRight, 
  Database, 
  Edit3, 
  Check, 
  Sparkles 
} from "lucide-react";
import { RiskBadge, SeverityBadge } from "./RiskBadge.jsx";
import { PROTOCOL_CONFIG } from "../data/protocolConfig.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTrial } from "../context/TrialContext.jsx";
import { PERMISSIONS } from "../auth/permissions.js";

export function PatientDetailDrawer({ patient, patientProfile, deviations = [], onClose, onSelectDeviation }) {
  if (!patient) return null;

  const { can, user } = useAuth();
  const { editPatientData, runComplianceAnalysis } = useTrial();
  const [successMessage, setSuccessMessage] = useState("");

  const patientDeviations = deviations.filter((d) => d.patientId === patient.id);

  const canEditData = can(PERMISSIONS.EDIT_PATIENT_DATA);

  // Check specific data issues for Data Manager correction
  const hasMissingCbc = !patient.labs.some((l) => l.labName.includes("CBC"));
  const nonStandardMed = patient.medications.find((m) => m.drugName === "Cardio-X" && m.doseMg !== 100);
  const hasMissingV2Vitals = patient.visits.some((v) => v.visitNumber === 2 && !v.vitals);
  const hasMissingV1Ecg = patient.visits.some(
    (v) => v.visitNumber === 1 && !v.proceduresCompleted?.includes("12-Lead Baseline ECG")
  );

  const hasAnyDataIssue = hasMissingCbc || Boolean(nonStandardMed) || hasMissingV2Vitals || hasMissingV1Ecg;

  const handleFixCbc = () => {
    editPatientData(
      patient.id,
      (pt) => ({
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
      }),
      `Clinical Data Manager uploaded missing CBC panel for subject ${patient.id}.`,
      user
    );
    setSuccessMessage("CBC lab record entered & audited. Run Compliance Analysis to clear deviation!");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleFixDose = () => {
    editPatientData(
      patient.id,
      (pt) => ({
        ...pt,
        medications: pt.medications.map((m) =>
          m.drugName === "Cardio-X" ? { ...m, doseMg: 100 } : m
        )
      }),
      `Clinical Data Manager corrected investigational dose for ${patient.id} to protocol-mandated 100mg QD.`,
      user
    );
    setSuccessMessage("Cardio-X dose updated to 100mg QD. Run Compliance Analysis to verify!");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleFixVitals = () => {
    editPatientData(
      patient.id,
      (pt) => ({
        ...pt,
        visits: pt.visits.map((v) =>
          v.visitNumber === 2
            ? { ...v, vitals: { bpSystolic: 124, bpDiastolic: 80, heartRate: 72 } }
            : v
        )
      }),
      `Clinical Data Manager reconciled unentered Visit 2 vital signs for ${patient.id}.`,
      user
    );
    setSuccessMessage("Visit 2 vital signs entered. eCRF query closed!");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleFixEcg = () => {
    editPatientData(
      patient.id,
      (pt) => ({
        ...pt,
        visits: pt.visits.map((v) =>
          v.visitNumber === 1
            ? {
                ...v,
                proceduresCompleted: [
                  ...(v.proceduresCompleted || []),
                  "12-Lead Baseline ECG"
                ]
              }
            : v
        )
      }),
      `Clinical Data Manager reconciled missing Baseline ECG procedure record for ${patient.id}.`,
      user
    );
    setSuccessMessage("Baseline ECG record reconciled in eCRF checklist!");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  // Helper to determine visit status badge
  const getVisitTimingBadge = (visit) => {
    const protoVisit = PROTOCOL_CONFIG.visits.find((v) => v.visitNumber === visit.visitNumber);
    if (!protoVisit) return null;

    if (visit.status === "Missed" || visit.actualDay === null) {
      return {
        label: "Missed Visit",
        status: "missed",
        classes: "bg-rose-100 text-rose-800 border-rose-300",
        icon: XCircle,
        subtext: "Required study interval omitted"
      };
    }

    const minDay = protoVisit.targetDay - protoVisit.windowDaysMinus;
    const maxDay = protoVisit.targetDay + protoVisit.windowDaysPlus;

    if (visit.actualDay < minDay) {
      const diff = minDay - visit.actualDay;
      return {
        label: `Early (-${diff}d)`,
        status: "early",
        classes: "bg-amber-50 text-amber-800 border-amber-200",
        icon: Clock,
        subtext: `Target: Day ${protoVisit.targetDay} ± ${protoVisit.windowDaysMinus} (Conducted: Day ${visit.actualDay})`
      };
    }

    if (visit.actualDay > maxDay) {
      const diff = visit.actualDay - maxDay;
      return {
        label: `Late (+${diff}d)`,
        status: "late",
        classes: "bg-rose-50 text-rose-800 border-rose-200",
        icon: AlertCircle,
        subtext: `Target: Day ${protoVisit.targetDay} ± ${protoVisit.windowDaysPlus} (Conducted: Day ${visit.actualDay})`
      };
    }

    return {
      label: "Compliant",
      status: "compliant",
      classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: CheckCircle2,
      subtext: `Target: Day ${protoVisit.targetDay} ± ${protoVisit.windowDaysPlus} (Conducted: Day ${visit.actualDay})`
    };
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-fade animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded">
                {patient.id}
              </span>
              <RiskBadge 
                band={patientProfile?.riskBand || "Low"} 
                score={patientProfile?.totalRiskScore || 0} 
              />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {patient.status}
              </span>
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-900">
              {patient.siteName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Demographics: {patient.age} yrs • {patient.gender} • Enrolled: {patient.enrollmentDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-900 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* DATA MANAGER ACTIONS (If permitted) */}
          {canEditData && (
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                    Data Manager eCRF Reconciliation
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-mono">
                  21 CFR Part 11
                </span>
              </div>

              {hasAnyDataIssue ? (
                <div className="space-y-2 mt-3">
                  {hasMissingCbc && (
                    <div className="p-2.5 rounded-lg bg-white border border-teal-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">Missing CBC with Differential</div>
                        <div className="text-[11px] text-slate-500">Hematology panel missing prior to Visit 3.</div>
                      </div>
                      <button
                        onClick={handleFixCbc}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold transition-colors"
                      >
                        Enter CBC (Normal)
                      </button>
                    </div>
                  )}

                  {nonStandardMed && (
                    <div className="p-2.5 rounded-lg bg-white border border-teal-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">Dose Discrepancy: {nonStandardMed.doseMg}mg QD</div>
                        <div className="text-[11px] text-slate-500">Protocol mandates 100mg QD Cardio-X.</div>
                      </div>
                      <button
                        onClick={handleFixDose}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold transition-colors"
                      >
                        Correct to 100mg
                      </button>
                    </div>
                  )}

                  {hasMissingV2Vitals && (
                    <div className="p-2.5 rounded-lg bg-white border border-teal-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">Visit 2 Vital Signs Missing</div>
                        <div className="text-[11px] text-slate-500">BP/HR fields unrecorded in eCRF.</div>
                      </div>
                      <button
                        onClick={handleFixVitals}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold transition-colors"
                      >
                        Record Vitals (124/80)
                      </button>
                    </div>
                  )}

                  {hasMissingV1Ecg && (
                    <div className="p-2.5 rounded-lg bg-white border border-teal-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">Baseline ECG Record Missing</div>
                        <div className="text-[11px] text-slate-500">Intake procedure checklist incomplete.</div>
                      </div>
                      <button
                        onClick={handleFixEcg}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold transition-colors"
                      >
                        Reconcile ECG
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-teal-800 mt-1">
                  All standard eCRF records, laboratory panels, and dosage entries for this participant are currently verified.
                </p>
              )}

              {/* Interactive eCRF Field Editor for Data Managers */}
              <div className="mt-3 pt-3 border-t border-teal-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-teal-900 uppercase">
                    Live eCRF Editor
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium">
                    Updates backend via PATCH /api/patients
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Dose Selector */}
                  <div className="bg-white p-2 rounded-lg border border-teal-200">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Cardio-X Dose (Target: 100mg)
                    </label>
                    <select
                      value={patient.medications.find((m) => m.isInvestigational)?.doseMg || 100}
                      onChange={(e) => {
                        const newDose = parseInt(e.target.value, 10);
                        editPatientData(
                          patient.id,
                          (pt) => ({
                            ...pt,
                            medications: pt.medications.map((m) =>
                              m.isInvestigational ? { ...m, doseMg: newDose } : m
                            ),
                          }),
                          `Data Manager modified Cardio-X dose to ${newDose}mg QD for subject ${patient.id}.`,
                          user
                        );
                        setSuccessMessage(`Cardio-X dose updated to ${newDose}mg. Click 'Run Compliance Analysis' to verify!`);
                        setTimeout(() => setSuccessMessage(""), 5000);
                      }}
                      className="w-full text-xs font-semibold py-1 px-2 border border-slate-300 rounded bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      <option value={100}>100 mg QD (Compliant Target)</option>
                      <option value={50}>50 mg QD (Dose Discrepancy - Major)</option>
                      <option value={150}>150 mg QD (Dose Discrepancy - Major)</option>
                      <option value={200}>200 mg QD (Overdose - Critical)</option>
                    </select>
                  </div>

                  {/* Prohibited Conmed Selector */}
                  <div className="bg-white p-2 rounded-lg border border-teal-200">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Concomitant Therapy (CYP3A4)
                    </label>
                    <select
                      value={
                        patient.medications.some((m) => m.drugName === "Drug-X")
                          ? "Drug-X"
                          : patient.medications.some((m) => m.drugName === "Ketoconazole")
                          ? "Ketoconazole"
                          : "None"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        editPatientData(
                          patient.id,
                          (pt) => {
                            const nonProhibited = pt.medications.filter(
                              (m) => m.drugName !== "Drug-X" && m.drugName !== "Ketoconazole"
                            );
                            if (val === "None") return { ...pt, medications: nonProhibited };
                            return {
                              ...pt,
                              medications: [
                                ...nonProhibited,
                                {
                                  drugName: val,
                                  doseMg: val === "Drug-X" ? 50 : 200,
                                  frequency: "QD",
                                  isInvestigational: false,
                                  startDate: "2026-02-01",
                                  prescriber: "External Specialist",
                                },
                              ],
                            };
                          },
                          `Data Manager updated concomitant therapy (${val}) for subject ${patient.id}.`,
                          user
                        );
                        setSuccessMessage(`Concomitant therapy set to '${val}'. Click 'Run Compliance Analysis' to verify!`);
                        setTimeout(() => setSuccessMessage(""), 5000);
                      }}
                      className="w-full text-xs font-semibold py-1 px-2 border border-slate-300 rounded bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="None">None (Compliant)</option>
                      <option value="Drug-X">Drug-X (Prohibited - Critical)</option>
                      <option value="Ketoconazole">Ketoconazole (Prohibited - Critical)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Profile Summary */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Compliance</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {patientProfile?.compliancePercentage || 100}%
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Deviations</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {patientDeviations.length} Flagged
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Site</span>
              <div className="text-xs font-bold text-slate-900 mt-0.5 font-mono">
                {patient.siteId}
              </div>
            </div>
          </div>

          {/* Protocol Visit Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Visit Protocol Adherence Timeline
              </h3>
              <span className="text-[10px] text-slate-400">3 Protocol Intervals</span>
            </div>

            <div className="space-y-3">
              {patient.visits.map((visit) => {
                const protoVisit = PROTOCOL_CONFIG.visits.find((v) => v.visitNumber === visit.visitNumber);
                const timing = getVisitTimingBadge(visit);
                const TimingIcon = timing.icon;

                return (
                  <div 
                    key={visit.visitNumber} 
                    className="p-4 rounded-lg border border-slate-200 bg-white shadow-subtle hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            Visit {visit.visitNumber}: {protoVisit?.name.split("(")[0]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Window: <span className="font-medium text-slate-700">{protoVisit?.windowDescription}</span>
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${timing.classes}`}>
                        <TimingIcon className="w-3.5 h-3.5" />
                        <span>{timing.label}</span>
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <span>Date: </span>
                        <span className="font-medium text-slate-800">{visit.date || "Not Recorded"}</span>
                      </div>
                      <div>
                        <span>Actual Day: </span>
                        <span className="font-mono font-bold text-slate-800">
                          {visit.actualDay != null ? `Day ${visit.actualDay}` : "Missed"}
                        </span>
                      </div>
                      <div>
                        <span>Procedures: </span>
                        <span className="font-medium text-slate-800">
                          {visit.proceduresCompleted?.length || 0} of {protoVisit?.requiredProcedures?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Deviations for this Patient */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
              <Activity className="w-4 h-4 text-rose-600" />
              Documented Protocol Deviations ({patientDeviations.length})
            </h3>

            {patientDeviations.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero protocol deviations recorded for this participant. Full adherence confirmed.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {patientDeviations.map((dev) => (
                  <div
                    key={dev.id}
                    onClick={() => onSelectDeviation && onSelectDeviation(dev)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{dev.id}</span>
                        <SeverityBadge severity={dev.severity} showWeight={true} />
                        <span className="text-[11px] font-medium text-slate-500">{dev.category}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-1">{dev.actual}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medications & Labs Snapshot */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-slate-600" />
              Medication & Concomitant Therapies
            </h3>
            <div className="space-y-1.5">
              {patient.medications.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                    m.drugName === "Drug-X" || m.drugName === "Ketoconazole"
                      ? "bg-rose-50 border-rose-200 text-rose-900 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.drugName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{m.doseMg}mg ({m.frequency})</span>
                    {m.isInvestigational && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">IP</span>
                    )}
                  </div>
                  {(m.drugName === "Drug-X" || m.drugName === "Ketoconazole") && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      PROHIBITED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 font-semibold text-xs text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
