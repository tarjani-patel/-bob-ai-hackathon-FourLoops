/**
 * Data Scoping Utility for TrialGuard AI Role-Based Access Control
 * 
 * Enforces server-side boundary checks on client state:
 * - Site Investigator is strictly scoped to their assigned site (e.g. SITE-03).
 * - Other roles receive trial-wide or role-relevant data.
 */

import { ROLES } from "./roleConfig.js";

export function getVisiblePatients(user, patients = []) {
  if (!user) return [];
  if (user.assignedSite) {
    return patients.filter((p) => p.siteId === user.assignedSite);
  }
  return patients;
}

export function getVisibleDeviations(user, deviations = []) {
  if (!user) return [];
  if (user.assignedSite) {
    return deviations.filter((d) => d.siteId === user.assignedSite);
  }
  return deviations;
}

export function getVisibleSites(user, siteRisks = []) {
  if (!user) return [];
  if (user.assignedSite) {
    return siteRisks.filter((s) => s.siteId === user.assignedSite);
  }
  return siteRisks;
}

export function getVisibleCapas(user, capas = []) {
  if (!user) return [];
  if (user.assignedSite) {
    return capas.filter((c) => c.siteId === user.assignedSite);
  }
  return capas;
}

export const getVisibleCAPAs = getVisibleCapas;

export function getVisibleReports(user, reports = []) {
  if (!user) return [];
  if (user.role === ROLES.INVESTIGATOR) {
    return []; // Site investigators do not have access to trial-wide regulatory dossiers
  }
  return reports;
}

export function getVisibleNotifications(user, notifications = []) {
  if (!user) return [];
  if (user.assignedSite) {
    return notifications.filter((n) => !n.siteId || n.siteId === user.assignedSite);
  }
  return notifications;
}
