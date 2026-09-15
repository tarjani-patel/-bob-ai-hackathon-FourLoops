/**
 * TrialGuard AI — Deterministic Risk Engine
 * 
 * Scores individual patients, clinical sites, and overall trial safety & compliance.
 * Implements severity weights (Critical: 15, Major: 10, Minor: 4, Admin: 1)
 * and risk modifiers (+5 repeated deviation, +5 multiple categories).
 * Normalizes site risk to a 0–100 scale.
 */

import { PROTOCOL_CONFIG } from "../data/protocolConfig.js";

export function calculatePatientRisk(patient, deviations, protocol = PROTOCOL_CONFIG) {
  const patientDevs = deviations.filter((d) => d.patientId === patient.id);
  
  if (patientDevs.length === 0) {
    return {
      patientId: patient.id,
      deviationCount: 0,
      basePoints: 0,
      repeatedModifier: 0,
      multipleCategoryModifier: 0,
      totalRiskScore: 0,
      riskBand: "Low",
      compliancePercentage: 100,
      status: patient.status || "Active",
      deviations: []
    };
  }

  // Base points from severity weights
  const basePoints = patientDevs.reduce((sum, d) => sum + (d.severityWeight || 0), 0);

  // Modifier: repeated deviations (+5 if patient has > 1 deviation)
  const repeatedModifier = patientDevs.length > 1 ? protocol.riskModifiers.repeatedDeviation : 0;

  // Modifier: multiple deviation categories (+5 if patient has deviations in > 1 category)
  const distinctCategories = new Set(patientDevs.map((d) => d.category));
  const multipleCategoryModifier = distinctCategories.size > 1 ? protocol.riskModifiers.multipleCategories : 0;

  const totalRiskScore = basePoints + repeatedModifier + multipleCategoryModifier;

  // Derive compliance %
  const compliancePercentage = Math.max(0, Math.min(100, Math.round(100 - totalRiskScore * 1.8)));

  let riskBand = "Low";
  if (totalRiskScore > 35) {
    riskBand = "High";
  } else if (totalRiskScore > 12) {
    riskBand = "Medium";
  }

  return {
    patientId: patient.id,
    deviationCount: patientDevs.length,
    basePoints,
    repeatedModifier,
    multipleCategoryModifier,
    totalRiskScore,
    riskBand,
    compliancePercentage,
    status: patient.status || "Active",
    deviations: patientDevs
  };
}

export function calculateSiteRisk(site, patients, deviations, protocol = PROTOCOL_CONFIG) {
  const sitePatients = patients.filter((p) => p.siteId === site.id);
  const siteDeviations = deviations.filter((d) => d.siteId === site.id);
  const patientCount = sitePatients.length || 1;

  // Calculate each patient's risk profile
  const patientProfiles = sitePatients.map((p) => calculatePatientRisk(p, deviations, protocol));
  const affectedPatients = patientProfiles.filter((p) => p.deviationCount > 0);

  // Sum of total risk points across all patients at this site
  const rawRiskPoints = patientProfiles.reduce((sum, p) => sum + p.totalRiskScore, 0);

  // Counts by severity
  const criticalDevs = siteDeviations.filter((d) => d.severity === "Critical");
  const majorDevs = siteDeviations.filter((d) => d.severity === "Major");
  const minorDevs = siteDeviations.filter((d) => d.severity === "Minor");
  const adminDevs = siteDeviations.filter((d) => d.severity === "Administrative");

  // Normalized 0–100 site risk formula based on density, proportion of affected cohort, and critical density
  const density = rawRiskPoints / patientCount;
  const affectedRatio = affectedPatients.length / patientCount;
  const criticalWeight = criticalDevs.length * 2.6;
  const majorWeight = majorDevs.length * 1.8;

  let normalizedScore = Math.round(density * 3.7 + affectedRatio * 18 + criticalWeight + majorWeight);
  // Clamp between 0 and 100
  normalizedScore = Math.max(0, Math.min(100, normalizedScore));

  // Determine band according to hackathon criteria (0-30 Low, 31-60 Medium, 61-100 High)
  let riskBand = "Low";
  if (normalizedScore >= 61) {
    riskBand = "High";
  } else if (normalizedScore >= 31) {
    riskBand = "Medium";
  }

  // Key risk drivers analysis
  const riskDrivers = [];
  if (criticalDevs.length > 0) {
    const types = [...new Set(criticalDevs.map(d => d.category))].join(", ");
    riskDrivers.push(`${criticalDevs.length} Critical Deviation${criticalDevs.length > 1 ? "s" : ""} (${types})`);
  }
  if (majorDevs.length >= 3) {
    riskDrivers.push(`High Major deviation density (${majorDevs.length} major violations recorded)`);
  }
  const multiViolationPts = patientProfiles.filter((p) => p.deviationCount > 1).length;
  if (multiViolationPts > 0) {
    riskDrivers.push(`${multiViolationPts} patient${multiViolationPts > 1 ? "s" : ""} with recurrent multi-category violations`);
  }
  if (affectedRatio > 0.3) {
    riskDrivers.push(`Elevated cohort contamination: ${(affectedRatio * 100).toFixed(0)}% of site subjects affected`);
  }
  if (riskDrivers.length === 0) {
    riskDrivers.push("Good protocol adherence; minimal isolated discrepancies");
  }

  // Deviation category breakdown
  const categoryBreakdown = siteDeviations.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {});

  return {
    siteId: site.id,
    siteCode: site.code,
    siteName: site.name,
    location: site.location,
    pi: site.pi,
    cra: site.cra,
    patientCount,
    affectedPatientCount: affectedPatients.length,
    deviationCount: siteDeviations.length,
    rawRiskPoints,
    score: normalizedScore,
    riskBand,
    criticalCount: criticalDevs.length,
    majorCount: majorDevs.length,
    minorCount: minorDevs.length,
    adminCount: adminDevs.length,
    riskDrivers,
    categoryBreakdown,
    deviations: siteDeviations,
    patientProfiles
  };
}

export function calculateTrialMetrics(sites, patients, deviations, protocol = PROTOCOL_CONFIG) {
  const siteRiskList = sites.map((s) => calculateSiteRisk(s, patients, deviations, protocol));
  
  // Rank sites by risk score descending
  siteRiskList.sort((a, b) => b.score - a.score);

  const totalPatients = patients.length || 1;
  const totalDeviations = deviations.length;
  const criticalDeviations = deviations.filter((d) => d.severity === "Critical").length;
  const majorDeviations = deviations.filter((d) => d.severity === "Major").length;
  const openDeviations = deviations.filter((d) => d.status !== "Resolved").length;

  const highRiskSites = siteRiskList.filter((s) => s.riskBand === "High");
  const mediumRiskSites = siteRiskList.filter((s) => s.riskBand === "Medium");

  // Overall trial risk score (weighted average of site risks)
  const trialRiskScore = Math.round(
    siteRiskList.reduce((sum, s) => sum + s.score, 0) / (siteRiskList.length || 1)
  );

  let trialRiskBand = "Low";
  if (trialRiskScore >= 61) trialRiskBand = "High";
  else if (trialRiskScore >= 31) trialRiskBand = "Medium";

  // Overall compliance rate
  const totalEvaluations = totalPatients * 5; // ~5 key checkpoints per patient
  const compliancePercentage = Math.max(0, Number(((1 - (totalDeviations / totalEvaluations)) * 100).toFixed(1)));

  return {
    trialId: protocol.trialId,
    trialName: protocol.trialName,
    phase: protocol.phase,
    totalPatients,
    totalSites: sites.length,
    totalDeviations,
    openDeviations,
    criticalDeviations,
    majorDeviations,
    trialRiskScore,
    trialRiskBand,
    compliancePercentage,
    highRiskSitesCount: highRiskSites.length,
    mediumRiskSitesCount: mediumRiskSites.length,
    siteRiskList
  };
}
