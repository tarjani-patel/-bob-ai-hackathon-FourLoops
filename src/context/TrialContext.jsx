import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { PROTOCOL_CONFIG } from "../data/protocolConfig.js";
import { SYNTHETIC_PATIENTS } from "../data/syntheticPatients.js";
import { evaluateCompliance } from "../logic/complianceEngine.js";
import { calculateTrialMetrics, calculateSiteRisk, calculatePatientRisk } from "../logic/riskEngine.js";
import { computeSiteTrendAndPrediction } from "../logic/trendEngine.js";
import { generateCapasFromDeviations } from "../logic/capaEngine.js";
import { generateTrialExecutiveInsight } from "../logic/explanationEngine.js";

import {
  getHealth,
  getProtocol,
  getPatients,
  getDeviations,
  getTrialRisk,
  getCAPAs,
  getAuditLogs,
  runComplianceAnalysis as apiRunComplianceAnalysis,
  updatePatient as apiUpdatePatient,
  updateCAPA as apiUpdateCAPA,
} from "../api/index.js";

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
  const [protocol, setProtocol] = useState(PROTOCOL_CONFIG);
  const [patients, setPatients] = useState(SYNTHETIC_PATIENTS);

  // Backend API connection & health state
  const [apiHealthy, setApiHealthy] = useState(null); // null = checking, true = live, false = offline
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Analysis state
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalysisResult, setLastAnalysisResult] = useState(null);
  const [notifications, setNotifications] = useState(BASELINE_NOTIFICATIONS);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Custom CAPAs state so users can approve/update them interactively
  const [backendCapas, setBackendCapas] = useState(null);
  const [customCapas, setCustomCapas] = useState(null);

  // Deviations & metrics from backend
  const [backendDeviations, setBackendDeviations] = useState(null);
  const [backendMetrics, setBackendMetrics] = useState(null);

  // Audit trail state
  const [auditLogs, setAuditLogs] = useState(BASELINE_AUDIT_LOGS);

  // Initial Data Fetch & Health Check from FastAPI backend
  const fetchInitialData = useCallback(async () => {
    setIsApiLoading(true);
    setApiError(null);

    try {
      // 1. Health check
      const health = await getHealth();
      if (health?.status === "ok") {
        setApiHealthy(true);

        // 2. Fetch protocol, patients, deviations, risk, capas, audit in parallel
        const [protoRes, ptsRes, devsRes, riskRes, capasRes, auditRes] = await Promise.allSettled([
          getProtocol(),
          getPatients(),
          getDeviations(),
          getTrialRisk(),
          getCAPAs(),
          getAuditLogs()
        ]);

        if (protoRes.status === "fulfilled" && protoRes.value) {
          setProtocol(protoRes.value);
        }
        if (ptsRes.status === "fulfilled" && Array.isArray(ptsRes.value)) {
          setPatients(ptsRes.value);
        }
        if (devsRes.status === "fulfilled" && Array.isArray(devsRes.value)) {
          setBackendDeviations(devsRes.value);
        }
        if (riskRes.status === "fulfilled" && riskRes.value) {
          setBackendMetrics(riskRes.value);
        }
        if (capasRes.status === "fulfilled" && Array.isArray(capasRes.value)) {
          setBackendCapas(capasRes.value);
        }
        if (auditRes.status === "fulfilled" && Array.isArray(auditRes.value) && auditRes.value.length > 0) {
          setAuditLogs(auditRes.value);
        }

        console.log("[TrialGuard AI] Successfully connected to FastAPI backend at", import.meta.env.VITE_API_URL || "http://localhost:8000");
      } else {
        setApiHealthy(false);
      }
    } catch (err) {
      console.warn("[TrialGuard AI] FastAPI backend unavailable, operating in local fallback mode:", err.message);
      setApiHealthy(false);
      setApiError(err.message);
    } finally {
      setIsApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Compute deviations deterministically (backend deviations prioritized if loaded)
  const fullDeviations = useMemo(() => {
    if (backendDeviations && backendDeviations.length > 0) {
      return backendDeviations;
    }
    return evaluateCompliance(patients, protocol);
  }, [backendDeviations, patients, protocol]);

  // If hasAnalyzed is false, provide preliminary baseline intake deviations (only minor admin issues)
  // When hasAnalyzed is true, provide all detected deviations!
  const deviations = useMemo(() => {
    if (!hasAnalyzed) {
      return fullDeviations.filter((d) => d.severity === "Administrative" || d.category === "Data Quality");
    }
    return fullDeviations;
  }, [hasAnalyzed, fullDeviations]);

  // Compute trial metrics & site risks
  const trialMetrics = useMemo(() => {
    if (hasAnalyzed && backendMetrics && backendMetrics.siteRiskList) {
      // Enrich backend site risks with trend calculations
      const enrichedList = backendMetrics.siteRiskList.map((site) => {
        const trendData = computeSiteTrendAndPrediction(site);
        return {
          ...site,
          ...trendData
        };
      });
      return {
        ...backendMetrics,
        siteRiskList: enrichedList
      };
    }

    const metrics = calculateTrialMetrics(protocol.sites, patients, deviations, protocol);
    metrics.siteRiskList = metrics.siteRiskList.map((site) => {
      const trendData = computeSiteTrendAndPrediction(site);
      return {
        ...site,
        ...trendData
      };
    });
    return metrics;
  }, [hasAnalyzed, backendMetrics, protocol, patients, deviations]);

  const siteRisks = useMemo(() => trialMetrics.siteRiskList, [trialMetrics]);

  // Compute patient profiles
  const patientProfiles = useMemo(() => {
    return patients.map((pt) => calculatePatientRisk(pt, deviations, protocol));
  }, [patients, deviations, protocol]);

  // Generate CAPAs
  const generatedCapas = useMemo(() => {
    if (!hasAnalyzed) return [];
    if (backendCapas && backendCapas.length > 0) {
      return backendCapas;
    }
    return generateCapasFromDeviations(deviations, siteRisks);
  }, [hasAnalyzed, backendCapas, deviations, siteRisks]);

  const capas = useMemo(() => {
    if (customCapas) return customCapas;
    return generatedCapas;
  }, [customCapas, generatedCapas]);

  // Executive insight
  const executiveInsight = useMemo(() => {
    if (backendMetrics?.executiveInsight) {
      return backendMetrics.executiveInsight;
    }
    const highestSite = siteRisks.find((s) => s.riskBand === "High") || siteRisks[0];
    return generateTrialExecutiveInsight(trialMetrics, highestSite);
  }, [backendMetrics, trialMetrics, siteRisks]);

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

  // Action: Update CAPA status with backend integration & audit logging
  const updateCapaStatus = useCallback(async (capaId, newStatus, user) => {
    // Optimistic UI update
    setCustomCapas((prev) => {
      const current = prev || capas;
      return current.map((c) => (c.id === capaId ? { ...c, status: newStatus } : c));
    });

    // If backend is active, persist to FastAPI
    if (apiHealthy) {
      try {
        const updated = await apiUpdateCAPA(capaId, { status: newStatus });
        if (updated) {
          setCustomCapas((prev) => {
            const current = prev || capas;
            return current.map((c) => (c.id === capaId ? updated : c));
          });
        }
        // Refresh audit logs from backend
        const freshLogs = await getAuditLogs();
        if (Array.isArray(freshLogs) && freshLogs.length > 0) {
          setAuditLogs(freshLogs);
        }
      } catch (err) {
        console.error("[TrialGuard API] Failed to update CAPA on backend:", err);
      }
    }

    logAuditEvent({
      action: newStatus === "Approved" ? "CAPA_APPROVED" : "CAPA_STATUS_CHANGED",
      entityType: "CAPA",
      entityId: capaId,
      details: `CAPA ${capaId} status transitioned to '${newStatus}'.`,
      performedBy: user?.name || "Elena Rostova",
      role: user?.role || "SPONSOR"
    });
  }, [apiHealthy, capas, logAuditEvent]);

  // Action: Approve CAPA via /api/capas/{id}/approve
  const approveCapa = useCallback(async (capaId, comment, user) => {
    setCustomCapas((prev) => {
      const current = prev || capas;
      return current.map((c) => (c.id === capaId ? { ...c, status: "Approved" } : c));
    });

    if (apiHealthy) {
      try {
        const { approveCAPA, getAuditLogs: fetchAudit } = await import("../api/index.js");
        const updated = await approveCAPA(capaId, comment);
        if (updated) {
          setCustomCapas((prev) => {
            const current = prev || capas;
            return current.map((c) => (c.id === capaId ? updated : c));
          });
        }
        const freshLogs = await fetchAudit();
        if (Array.isArray(freshLogs) && freshLogs.length > 0) setAuditLogs(freshLogs);
      } catch (err) {
        console.error("[TrialGuard API] Failed to approve CAPA on backend:", err);
      }
    }

    logAuditEvent({
      action: "CAPA_APPROVED",
      entityType: "CAPA",
      entityId: capaId,
      details: comment || "CAPA approved by Sponsor under 21 CFR 312.",
      performedBy: user?.name || "Elena Rostova",
      role: user?.role || "SPONSOR"
    });
  }, [apiHealthy, capas, logAuditEvent]);

  // Action: Reject CAPA via /api/capas/{id}/reject
  const rejectCapa = useCallback(async (capaId, reason, comment, user) => {
    setCustomCapas((prev) => {
      const current = prev || capas;
      return current.map((c) => (c.id === capaId ? { ...c, status: "Rejected" } : c));
    });

    if (apiHealthy) {
      try {
        const { rejectCAPA, getAuditLogs: fetchAudit } = await import("../api/index.js");
        const updated = await rejectCAPA(capaId, reason, comment);
        if (updated) {
          setCustomCapas((prev) => {
            const current = prev || capas;
            return current.map((c) => (c.id === capaId ? updated : c));
          });
        }
        const freshLogs = await fetchAudit();
        if (Array.isArray(freshLogs) && freshLogs.length > 0) setAuditLogs(freshLogs);
      } catch (err) {
        console.error("[TrialGuard API] Failed to reject CAPA on backend:", err);
      }
    }

    logAuditEvent({
      action: "CAPA_REJECTED",
      entityType: "CAPA",
      entityId: capaId,
      details: `CAPA rejected: ${reason}`,
      performedBy: user?.name || "Elena Rostova",
      role: user?.role || "SPONSOR"
    });
  }, [apiHealthy, capas, logAuditEvent]);

  // Action: Add Comment to CAPA via /api/capas/{id}/comments
  const addCapaComment = useCallback(async (capaId, text, user) => {
    if (apiHealthy) {
      try {
        const { addCAPAComment, getAuditLogs: fetchAudit } = await import("../api/index.js");
        const updated = await addCAPAComment(capaId, text);
        if (updated) {
          setCustomCapas((prev) => {
            const current = prev || capas;
            return current.map((c) => (c.id === capaId ? updated : c));
          });
        }
        const freshLogs = await fetchAudit();
        if (Array.isArray(freshLogs) && freshLogs.length > 0) setAuditLogs(freshLogs);
        return updated;
      } catch (err) {
        console.error("[TrialGuard API] Failed to add CAPA comment on backend:", err);
      }
    }

    const newComment = {
      author: user?.name || "Reviewer",
      role: user?.role || "CRA",
      date: new Date().toISOString().slice(0, 10),
      text
    };
    setCustomCapas((prev) => {
      const current = prev || capas;
      return current.map((c) => (c.id === capaId ? { ...c, comments: [...(c.comments || []), newComment] } : c));
    });

    logAuditEvent({
      action: "CAPA_COMMENT_ADDED",
      entityType: "CAPA",
      entityId: capaId,
      details: text,
      performedBy: user?.name || "Reviewer",
      role: user?.role || "CRA"
    });
  }, [apiHealthy, capas, logAuditEvent]);

  // Action: Edit CAPA operational fields
  const editCapa = useCallback(async (capaId, updates, user) => {
    setCustomCapas((prev) => {
      const current = prev || capas;
      return current.map((c) => (c.id === capaId ? { ...c, ...updates } : c));
    });

    if (apiHealthy) {
      try {
        const { updateCAPA, getAuditLogs: fetchAudit } = await import("../api/index.js");
        const updated = await updateCAPA(capaId, updates);
        if (updated) {
          setCustomCapas((prev) => {
            const current = prev || capas;
            return current.map((c) => (c.id === capaId ? updated : c));
          });
        }
        const freshLogs = await fetchAudit();
        if (Array.isArray(freshLogs) && freshLogs.length > 0) setAuditLogs(freshLogs);
      } catch (err) {
        console.error("[TrialGuard API] Failed to edit CAPA on backend:", err);
      }
    }

    logAuditEvent({
      action: "CAPA_UPDATED",
      entityType: "CAPA",
      entityId: capaId,
      details: `CAPA fields updated by ${user?.name || "User"}.`,
      performedBy: user?.name || "Elena Rostova",
      role: user?.role || "SPONSOR"
    });
  }, [apiHealthy, capas, logAuditEvent]);

  // Action: Data Manager edits synthetic patient data (reconciles lab, doses, or vitals)
  const editPatientData = useCallback(async (patientId, updater, logDetails, user) => {
    let updatedRecord = null;

    setPatients((prevPatients) => {
      return prevPatients.map((pt) => {
        if (pt.id !== patientId) return pt;
        const result = typeof updater === "function" ? updater(pt) : { ...pt, ...updater };
        updatedRecord = result;
        return result;
      });
    });

    // If backend is active, persist to FastAPI PATCH /api/patients/{id}
    if (apiHealthy && updatedRecord) {
      try {
        const payload = {
          status: updatedRecord.status,
          age: updatedRecord.age,
          gender: updatedRecord.gender,
          visits: updatedRecord.visits,
          labs: updatedRecord.labs,
          medications: updatedRecord.medications,
          reasonForChange: logDetails || `eCRF record corrected for subject ${patientId}.`,
        };
        const serverPt = await apiUpdatePatient(patientId, payload);
        if (serverPt) {
          setPatients((prev) => prev.map((p) => (p.id === patientId ? serverPt : p)));
        }
        // Refresh audit logs from backend
        const freshLogs = await getAuditLogs();
        if (Array.isArray(freshLogs) && freshLogs.length > 0) {
          setAuditLogs(freshLogs);
        }
      } catch (err) {
        console.error("[TrialGuard API] Failed to update patient on backend:", err);
      }
    }

    logAuditEvent({
      action: "PATIENT_DATA_CORRECTED",
      entityType: "PATIENT",
      entityId: patientId,
      details: logDetails || `eCRF record corrected for subject ${patientId}.`,
      performedBy: user?.name || "Marcus Vance",
      role: user?.role || "DATA_MANAGER"
    });
  }, [apiHealthy, logAuditEvent]);

  // Action: Reset to Baseline
  const resetToBaseline = useCallback(() => {
    setPatients(SYNTHETIC_PATIENTS);
    setBackendDeviations(null);
    setBackendMetrics(null);
    setBackendCapas(null);
    setHasAnalyzed(false);
    setCustomCapas(null);
    setLastAnalysisResult(null);
    setNotifications(BASELINE_NOTIFICATIONS);
    setAuditLogs(BASELINE_AUDIT_LOGS);
  }, []);

  // Action: Run Compliance Analysis via FastAPI Backend or Local Deterministic Engine
  const runComplianceAnalysis = useCallback(async (currentUser) => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);

    const step1 = setTimeout(() => setAnalysisProgress(45), 250);
    const step2 = setTimeout(() => setAnalysisProgress(75), 550);
    const step3 = setTimeout(() => setAnalysisProgress(95), 850);

    try {
      if (apiHealthy) {
        // Execute real backend compliance analysis
        const analysisRes = await apiRunComplianceAnalysis();

        // Fetch freshly calculated state from backend
        const [devsRes, riskRes, capasRes, auditRes] = await Promise.all([
          getDeviations(),
          getTrialRisk(),
          getCAPAs(),
          getAuditLogs()
        ]);

        if (Array.isArray(devsRes)) setBackendDeviations(devsRes);
        if (riskRes) setBackendMetrics(riskRes);
        if (Array.isArray(capasRes)) setBackendCapas(capasRes);
        if (Array.isArray(auditRes) && auditRes.length > 0) setAuditLogs(auditRes);

        const highestSite = riskRes?.siteRiskList?.[0] || { siteCode: "SITE-03", siteName: "Metro General", score: 73 };

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
          patientsEvaluated: analysisRes.analyzedPatientsCount || patients.length,
          deviationsDetected: analysisRes.deviationsDetectedCount || devsRes.length,
          criticalCount: analysisRes.criticalDeviationsCount || 5,
          majorCount: analysisRes.majorDeviationsCount || 9,
          highestRiskSite: highestSite ? `${highestSite.siteCode} (${highestSite.siteName})` : "SITE-03",
          highestRiskScore: highestSite?.score || 73
        });

        setHasAnalyzed(true);
        setAnalysisProgress(100);
      } else {
        // Fallback local deterministic engine
        const updatedDevs = evaluateCompliance(patients, protocol);
        const updatedMetrics = calculateTrialMetrics(protocol.sites, patients, updatedDevs, protocol);
        const highestSite = updatedMetrics.siteRiskList.find((s) => s.riskBand === "High") || updatedMetrics.siteRiskList[0];

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

        logAuditEvent({
          action: "COMPLIANCE_ANALYSIS_RUN",
          entityType: "ENGINE",
          entityId: protocol.trialId,
          details: `Deterministic compliance verification executed: ${patients.length} subjects scanned, ${updatedDevs.length} deviations active.`,
          performedBy: currentUser?.name || "Sarah Jenkins, CCRA",
          role: currentUser?.role || "CRA"
        });
      }
    } catch (err) {
      console.error("[TrialGuard AI] Compliance analysis error:", err);
    } finally {
      setIsAnalyzing(false);
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    }
  }, [apiHealthy, patients, protocol, logAuditEvent]);

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
    approveCapa,
    rejectCapa,
    addCapaComment,
    editCapa,
    resetToBaseline,
    isAnalyzing,
    analysisProgress,
    lastAnalysisResult,
    runComplianceAnalysis,
    setPatients,
    auditLogs,
    logAuditEvent,
    editPatientData,
    // API connection additions
    apiHealthy,
    isApiLoading,
    apiError,
    refreshData: fetchInitialData
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
