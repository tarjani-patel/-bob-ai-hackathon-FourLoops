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

  // Compute deviations deterministically
  const fullDeviations = useMemo(() => {
    return evaluateCompliance(patients, protocol);
  }, [patients, protocol]);

  // If hasAnalyzed is false, provide preliminary baseline intake deviations (only 4 minor admin issues)
  // When hasAnalyzed is true, provide all 32 detected deviations!
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

  // Action: Mark all notifications read
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Action: Mark single notification read
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // Action: Update CAPA status
  const updateCapaStatus = useCallback((capaId, newStatus) => {
    setCustomCapas((prev) => {
      const current = prev || generatedCapas;
      return current.map((c) => (c.id === capaId ? { ...c, status: newStatus } : c));
    });
  }, [generatedCapas]);

  // Action: Reset to Baseline
  const resetToBaseline = useCallback(() => {
    setHasAnalyzed(false);
    setCustomCapas(null);
    setLastAnalysisResult(null);
    setNotifications(BASELINE_NOTIFICATIONS);
  }, []);

  // Action: Run Compliance Analysis
  const runComplianceAnalysis = useCallback(() => {
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
    }, 1000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
    };
  }, [patients, protocol]);

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
    setPatients
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
