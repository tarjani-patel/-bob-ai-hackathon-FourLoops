import React from "react";
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
  ChevronRight
} from "lucide-react";
import { RiskBadge, SeverityBadge } from "./RiskBadge.jsx";
import { PROTOCOL_CONFIG } from "../data/protocolConfig.js";

export function PatientDetailDrawer({ patient, patientProfile, deviations = [], onClose, onSelectDeviation }) {
  if (!patient) return null;

  const patientDeviations = deviations.filter((d) => d.patientId === patient.id);

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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Risk Score</span>
              <div className="mt-1 text-xl font-bold text-slate-900 font-mono">
                {patientProfile?.totalRiskScore ?? 0}
              </div>
              <span className="text-[10px] text-slate-500">
                {patientProfile?.repeatedModifier > 0 ? "+5 repeat mod" : "Standard"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Compliance</span>
              <div className="mt-1 text-xl font-bold text-emerald-700 font-mono">
                {patientProfile?.compliancePercentage ?? 100}%
              </div>
              <span className="text-[10px] text-slate-500">Protocol adherence</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Deviations</span>
              <div className={`mt-1 text-xl font-bold font-mono ${patientDeviations.length > 0 ? "text-rose-600" : "text-slate-900"}`}>
                {patientDeviations.length}
              </div>
              <span className="text-[10px] text-slate-500">Documented events</span>
            </div>
          </div>

          {/* ======================================================= */}
          {/* VISIT TIMELINE (Visual: compliant, early, late, missed) */}
          {/* ======================================================= */}
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
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">IP</span>
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
