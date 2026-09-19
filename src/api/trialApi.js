/**
 * TrialGuard AI — Core API Service Functions
 *
 * Provides reusable functions for all backend endpoints across
 * Trial, Protocol, Sites, Patients, Deviations, Risk, CAPA, Reports, and Audit.
 */

import { apiClient, downloadFile } from "./client.js";

// Health check
export async function getHealth() {
  return apiClient("/api/health");
}

// Trial & Protocol
export async function getTrial() {
  return apiClient("/api/trial");
}

export async function getProtocol() {
  return apiClient("/api/protocol");
}

export async function updateProtocol(tolerances) {
  return apiClient("/api/protocol", {
    method: "PATCH",
    body: JSON.stringify(tolerances),
  });
}

export const updateProtocolTolerances = updateProtocol;

export async function getSites() {
  return apiClient("/api/sites");
}

export async function getSite(siteId) {
  return apiClient(`/api/sites/${encodeURIComponent(siteId)}`);
}

// Patients & eCRF
export async function getPatients(params = {}) {
  // params: { site_id, search, status }
  return apiClient("/api/patients", { params });
}

export async function getPatient(patientId) {
  return apiClient(`/api/patients/${encodeURIComponent(patientId)}`);
}

export async function updatePatient(patientId, updates) {
  return apiClient(`/api/patients/${encodeURIComponent(patientId)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

// Deviations
export async function getDeviations(params = {}) {
  // params: { site_id, patient_id, severity, category, status }
  return apiClient("/api/deviations", { params });
}

export async function getDeviation(deviationId) {
  return apiClient(`/api/deviations/${encodeURIComponent(deviationId)}`);
}

// Risk & Scoring
export async function getTrialRisk() {
  return apiClient("/api/risk/trial");
}

export async function getSitesRisk() {
  return apiClient("/api/risk/sites");
}

export async function getSiteRisk(siteId) {
  return apiClient(`/api/risk/sites/${encodeURIComponent(siteId)}`);
}

export async function getPatientRisk(patientId) {
  return apiClient(`/api/risk/patients/${encodeURIComponent(patientId)}`);
}

// CAPA
export async function getCAPAs(params = {}) {
  // params: { site_id, status, priority }
  return apiClient("/api/capas", { params });
}

export async function getCAPA(capaId) {
  return apiClient(`/api/capas/${encodeURIComponent(capaId)}`);
}

export async function createCAPA(capaData) {
  return apiClient("/api/capas", {
    method: "POST",
    body: JSON.stringify(capaData),
  });
}

export async function updateCAPA(capaId, updates) {
  return apiClient(`/api/capas/${encodeURIComponent(capaId)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function approveCAPA(capaId, comment) {
  return apiClient(`/api/capas/${encodeURIComponent(capaId)}/approve`, {
    method: "POST",
    body: JSON.stringify({ comment }),
  });
}

export async function rejectCAPA(capaId, reason, comment) {
  return apiClient(`/api/capas/${encodeURIComponent(capaId)}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason, comment }),
  });
}

export async function addCAPAComment(capaId, text) {
  return apiClient(`/api/capas/${encodeURIComponent(capaId)}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function exportCapaDossier(format = "json", filters = {}) {
  return downloadFile("/api/capas/export", {
    params: {
      format,
      site_id: filters.siteId || filters.site_id,
      status: filters.status,
      priority: filters.priority,
    }
  }, `TrialGuard_CAPA_Dossier.${format === "doc" ? "doc" : format}`);
}

export async function exportCapa(capaId, format = "json") {
  return downloadFile(`/api/capas/${encodeURIComponent(capaId)}/export`, {
    params: { format }
  }, `TrialGuard_${capaId}_Form.${format === "doc" ? "doc" : format}`);
}

// Reports & Audit
export async function getReports() {
  return apiClient("/api/reports");
}

export async function exportReport(reportId = "REP-01", format = "json") {
  return downloadFile("/api/reports/export", {
    params: { report_id: reportId, format }
  }, `TrialGuard_Report_${reportId}.${format === "doc" ? "doc" : format}`);
}

export async function getAuditLogs(params = {}) {
  // params: { site_id, role, action, limit }
  return apiClient("/api/audit", { params });
}

export async function postSessionAuditEvent(action, details = {}) {
  return apiClient("/api/audit/session-event", {
    method: "POST",
    body: JSON.stringify({ action, details }),
  });
}

// Compliance Engine Execution
export async function runComplianceAnalysis(options = {}) {
  // options: { siteId, patientId, forceRecalculate }
  return apiClient("/api/compliance/analyze", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

// IBM watsonx.ai Granite Foundation Model Integration
export async function getAIHealth() {
  return apiClient("/api/ai/health");
}

export async function explainDeviationWithAI(payload) {
  // payload: { deviationId, patientId, siteId, siteName, category, type, severity, expected, actual, evidence }
  return apiClient("/api/ai/explain-deviation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSiteInsightWithAI(payload) {
  // payload: { siteId, siteName, score, riskBand, trend, predictedScore, criticalCount, majorCount, deviationCount, topDrivers, recentDeviations }
  return apiClient("/api/ai/site-insight", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCAPARecommendationWithAI(payload) {
  // payload: { capaId, siteId, siteName, category, problemStatement, evidence, existingHypothesis, linkedDeviations }
  return apiClient("/api/ai/capa-recommendation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

