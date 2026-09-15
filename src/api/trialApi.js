/**
 * TrialGuard AI — Core API Service Functions
 *
 * Provides reusable functions for all backend endpoints across
 * Trial, Protocol, Sites, Patients, Deviations, Risk, CAPA, Reports, and Audit.
 */

import { apiClient } from "./client.js";

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

// Reports & Audit
export async function getReports() {
  return apiClient("/api/reports");
}

export async function getAuditLogs(params = {}) {
  // params: { site_id, role, action, limit }
  return apiClient("/api/audit", { params });
}

// Compliance Engine Execution
export async function runComplianceAnalysis(options = {}) {
  // options: { siteId, patientId, forceRecalculate }
  return apiClient("/api/compliance/analyze", {
    method: "POST",
    body: JSON.stringify(options),
  });
}
