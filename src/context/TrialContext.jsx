import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { PROTOCOL_CONFIG } from "../data/protocolConfig.js";
import { SYNTHETIC_PATIENTS } from "../data/syntheticPatients.js";
import { evaluateCompliance } from "../logic/complianceEngine.js";
import { calculateTrialMetrics, calculateSiteRisk, calculatePatientRisk } from "../logic/riskEngine.js";
import { computeSiteTrendAndPrediction } from "../logic/trendEngine.js";
import { generateCapasFromDeviations } from "../logic/capaEngine.js";
import { generateTrialExecutiveInsight } from "../logic/explanationEngine.js";

const TrialContext = createContext(null);

// Baseline initial notifications before comprehensive scan
const BASELINE_NOTIFICATIONS = [
  {
    id: "NOTIF-INIT-01",
    type: "Info",
    title: "Cohort Ingestion Synchronized",
    message: "Trial CT-101 (Cardio-X Phase III): 104 subject eCRF records ingested across 5 active investigation centers.",
    timestamp: "10 mins ago",
    read: false,
    actionLink: "/trial-protocol"
  },
  {
    id: "NOTIF-INIT-02",
    type: "Warnings",
    title: "Intake Screen Discrepancy",
    message: "Participant PT-1014: Non-critical procedure record pending verification at Site 01.",
    timestamp: "25 mins ago",
    read: false,
    patientId: "PT-1014",
    actionLink: "/patients"
  }
];

// Baseline audit logs compliant with 21 CFR Part 11 requirements
const BASELINE_AUDIT_LOGS = [
  {
    id: "AUD-2026-001",
    timestamp: "2026-01-05 08:00:12 UTC",
    action: "PROTOCOL_FREEZE",
    entityType: "PROTOCOL",
    entityId: "CT-101",
    details: "Protocol Cardio-X Phase III v3.2 ingested and locked under 21 CFR Part 11 electronic signature.",
    performedBy: "Elena Rostova",
    role: "SPONSOR"
  },
  {
    id: "AUD-2026-002",
    timestamp: "2026-01-08 09:14:40 UTC",
    action: "SITE_ACTIVATION",
    entityType: "SITE",
    entityId: "SITE-03",
    details: "Metro General Health Science Center activated with Investigator Dr. Evelyn Zhao, MD.",
    performedBy: "Sarah Jenkins, CCRA",
    role: "CRA"
  },
  {
    id: "AUD-2026-003",
    timestamp: "2026-01-15 11:22:05 UTC",
    action: "COHORT_INGESTION",
    entityType: "PATIENT_DATA",
    entityId: "104 Patients",
    details: "Automated sync of 104 patient eCRF and lab records across 5 investigation sites.",
    performedBy: "Marcus Vance",
    role: "DATA_MANAGER"
  }
];

export function TrialProvider({ children }) {
  const [protocol] = useState(PROTOCOL_CONFIG);
  const [patients, setPatients] = useState(SYNTHETIC_PATIENTS);

  // Analysis state: starts unanalyzed to make the "Run Compliance Analysis" action clearly impactful
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalysisResult, setLastAnalysisResult] = useState(null);
  const [notifications, setNotifications] = useState(BASELINE_NOTIFICATIONS);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Custom CAPAs state so users can approve/update them interactively
  const [customCapas, setCustomCapas] = useState(null);

  // Audit trail state
  const [auditLogs, setAuditLogs] = useState(BASELINE_AUDIT_LOGS);

  // Compute deviations deterministically
  const fullDeviations = useMemo(() => {
    return evaluateCompliance(patients, protocol);
  }, [patients, protocol]);

  // If hasAnalyzed is false, provide preliminary baseline intake deviations (only 4 minor admin issues)
  // When hasAnalyzed is true, provide all detected deviations!
  const deviations = useMemo(() => {
    if (!hasAnalyzed) {
      return fullDeviations.filter((d) => d.severity === "Administrative" || d.category === "Data Quality");
    }
    return fullDeviations;
  }, [hasAnalyzed, fullDeviations]);

  // Compute trial metrics & site risks
  const trialMetrics = useMemo(() => {
    const metrics = calculateTrialMetrics(protocol.sites, patients, deviations, protocol);
    // Enrich each site with trend and predictive forecast
    metrics.siteRiskList = metrics.siteRiskList.map((site) => {
      const trendData = computeSiteTrendAndPrediction(site);
      return {
        ...site,
        ...trendData
      };
    });
    return metrics;
  }, [protocol, patients, deviations]);

  const siteRisks = useMemo(() => trialMetrics.siteRiskList, [trialMetrics]);

  // Compute patient profiles
  const patientProfiles = useMemo(() => {
    return patients.map((pt) => calculatePatientRisk(pt, deviations, protocol));
  }, [patients, deviations, protocol]);

  // Generate CAPAs
  const generatedCapas = useMemo(() => {
    if (!hasAnalyzed) return [];
    return generateCapasFromDeviations(deviations, siteRisks);
  }, [hasAnalyzed, deviations, siteRisks]);

  const capas = useMemo(() => {
    if (customCapas) return customCapas;
    return generatedCapas;
  }, [customCapas, generatedCapas]);

  // Executive AI-style insight
  const executiveInsight = useMemo(() => {
    const highestSite = siteRisks.find((s) => s.riskBand === "High") || siteRisks[0];
    return generateTrialExecutiveInsight(trialMetrics, highestSite);
  }, [trialMetrics, siteRisks]);

  // Unread notification count
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Audit logging function
  const logAuditEvent = useCallback(({ action, entityType, entityId, details, performedBy, role }) => {
    const newEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
      action,
      entityType: entityType || "SYSTEM",
      entityId: entityId || "GENERAL",
      details,
      performedBy: performedBy || "System Automator",
      role: role || "SYSTEM"
    };

    setAuditLogs((prev) => [newEntry, ...prev]);
    return newEntry;
  }, []);

  // Action: Mark all notifications read
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Action: Mark single notification read
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // Action: Update CAPA status with audit logging
  const updateCapaStatus = useCallback((capaId, newStatus, user) => {
    setCustomCapas((prev) => {
      const current = prev || generatedCapas;
      return current.map((c) => (c.id === capaId ? { ...c, status: newStatus } : c));
    });

    logAuditEvent({
      action: newStatus === "Approved" ? "CAPA_APPROVED" : "CAPA_STATUS_CHANGED",
      entityType: "CAPA",
      entityId: capaId,
      details: `CAPA ${capaId} status transitioned to '${newStatus}'.`,
      performedBy: user?.name || "Elena Rostova",
      role: user?.role || "SPONSOR"
    });
  }, [generatedCapas, logAuditEvent]);

  // Action: Data Manager edits synthetic patient data (reconciles lab, doses, or vitals)
  const editPatientData = useCallback((patientId, updater, logDetails, user) => {
    setPatients((prevPatients) => {
      return prevPatients.map((pt) => {
        if (pt.id !== patientId) return pt;
        if (typeof updater === "function") {
          return updater(pt);
        }
        return { ...pt, ...updater };
      });
    });

    logAuditEvent({
      action: "PATIENT_DATA_CORRECTED",
      entityType: "PATIENT",
      entityId: patientId,
      details: logDetails || `eCRF record corrected for subject ${patientId}.`,
      performedBy: user?.name || "Marcus Vance",
      role: user?.role || "DATA_MANAGER"
    });
  }, [logAuditEvent]);

  // Action: Reset to Baseline
  const resetToBaseline = useCallback(() => {
    setPatients(SYNTHETIC_PATIENTS);
    setHasAnalyzed(false);
    setCustomCapas(null);
    setLastAnalysisResult(null);
    setNotifications(BASELINE_NOTIFICATIONS);
    setAuditLogs(BASELINE_AUDIT_LOGS);
  }, []);

  // Action: Run Compliance Analysis
  const runComplianceAnalysis = useCallback((currentUser) => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);

    const step1 = setTimeout(() => setAnalysisProgress(45), 250);
    const step2 = setTimeout(() => setAnalysisProgress(75), 550);
    const step3 = setTimeout(() => setAnalysisProgress(95), 850);

    const step4 = setTimeout(() => {
      // Deterministically evaluate full compliance
      const updatedDevs = evaluateCompliance(patients, protocol);
      const updatedMetrics = calculateTrialMetrics(protocol.sites, patients, updatedDevs, protocol);
      const highestSite = updatedMetrics.siteRiskList.find((s) => s.riskBand === "High") || updatedMetrics.siteRiskList[0];

      // New high-priority alerts generated by analysis
      const newAlerts = [
        {
          id: `NOTIF-ANA-${Date.now()}-1`,
          type: "Critical",
          title: "Site 03 Risk Escalation (High)",
          message: `Site 03 (Metro General) crossed High risk threshold (${highestSite?.score || 73}/100). Recurrent visit window and dosing breaches identified.`,
          timestamp: "Just now",
          read: false,
          siteId: "SITE-03",
          actionLink: "/sites"
        },
        {
          id: `NOTIF-ANA-${Date.now()}-2`,
          type: "Critical",
          title: "Major Protocol Deviation Flagged",
          message: "Participant PT-1043 prescribed prohibited substance 'Drug-X' (strong CYP3A4 inhibitor). Immediate review required.",
          timestamp: "Just now",
          read: false,
          patientId: "PT-1043",
          actionLink: "/deviations"
        },
        {
          id: `NOTIF-ANA-${Date.now()}-3`,
          type: "Warnings",
          title: "Visit Window Deviation Detected",
          message: "Participant PT-1042 completed Visit 2 on Day 20 (+6 days past protocol window).",
          timestamp: "Just now",
          read: false,
          patientId: "PT-1042",
          actionLink: "/deviations"
        },
        {
          id: `NOTIF-ANA-${Date.now()}-4`,
          type: "Warnings",
          title: "CAPA-2026-001 Generated",
          message: "Automated corrective action proposed for Site 03 scheduling non-compliance. Human review required.",
          timestamp: "Just now",
          read: false,
          actionLink: "/capa"
        }
      ];

      setNotifications((prev) => [...newAlerts, ...prev]);

      setLastAnalysisResult({
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        patientsEvaluated: patients.length,
        deviationsDetected: updatedDevs.length,
        criticalCount: updatedMetrics.criticalDeviations,
        majorCount: updatedMetrics.majorDeviations,
        highestRiskSite: highestSite ? `${highestSite.siteCode} (${highestSite.siteName})` : "Site 03",
        highestRiskScore: highestSite?.score || 73
      });

      setHasAnalyzed(true);
      setAnalysisProgress(100);
      setIsAnalyzing(false);

      // Audit log entry for analysis execution
      logAuditEvent({
        action: "COMPLIANCE_ANALYSIS_RUN",
        entityType: "ENGINE",
        entityId: protocol.trialId,
        details: `Deterministic compliance verification executed: ${patients.length} subjects scanned, ${updatedDevs.length} deviations active.`,
        performedBy: currentUser?.name || "Sarah Jenkins, CCRA",
        role: currentUser?.role || "CRA"
      });
    }, 1000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
    };
  }, [patients, protocol, logAuditEvent]);

  const value = {
    protocol,
    patients,
    hasAnalyzed,
    deviations,
    fullDeviations,
    trialMetrics,
    siteRisks,
    patientProfiles,
    capas,
    executiveInsight,
    notifications,
    unreadNotificationCount,
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    markAllNotificationsRead,
    markNotificationRead,
    updateCapaStatus,
    resetToBaseline,
    isAnalyzing,
    analysisProgress,
    lastAnalysisResult,
    runComplianceAnalysis,
    setPatients,
    auditLogs,
    logAuditEvent,
    editPatientData
  };

  return <TrialContext.Provider value={value}>{children}</TrialContext.Provider>;
}

export function useTrial() {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error("useTrial must be used within a TrialProvider");
  }
  return context;
}
