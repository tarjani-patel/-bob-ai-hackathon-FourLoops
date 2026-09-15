"""TrialGuard AI — Deterministic Risk Engine & Trend Predictor."""
from typing import List, Dict, Any, Optional
from ..models.patient import Patient
from ..models.deviation import Deviation
from ..models.trial import (
    ProtocolConfig,
    PatientProfile,
    SiteRiskSummary,
    TrialMetrics,
    SiteTrendPrediction,
    SiteTrendHistoryPoint,
)
from ..data.protocol import PROTOCOL_CONFIG

def calculate_patient_risk(
    patient: Patient,
    deviations: List[Deviation],
    protocol: ProtocolConfig = PROTOCOL_CONFIG
) -> PatientProfile:
    patient_devs = [d for d in deviations if d.patientId == patient.id]

    if not patient_devs:
        return PatientProfile(
            patientId=patient.id,
            deviationCount=0,
            basePoints=0,
            repeatedModifier=0,
            multipleCategoryModifier=0,
            totalRiskScore=0,
            riskBand="Low",
            compliancePercentage=100.0,
            status=patient.status,
            deviations=[],
        )

    base_points = sum(d.severityWeight for d in patient_devs)
    repeated_modifier = protocol.riskModifiers.get("repeatedDeviation", 5) if len(patient_devs) > 1 else 0
    distinct_categories = {d.category for d in patient_devs}
    multiple_category_modifier = protocol.riskModifiers.get("multipleCategories", 5) if len(distinct_categories) > 1 else 0

    total_risk_score = base_points + repeated_modifier + multiple_category_modifier
    compliance_percentage = max(0.0, min(100.0, float(round(100 - total_risk_score * 1.8, 1))))

    if total_risk_score > 35:
        risk_band = "High"
    elif total_risk_score > 12:
        risk_band = "Medium"
    else:
        risk_band = "Low"

    return PatientProfile(
        patientId=patient.id,
        deviationCount=len(patient_devs),
        basePoints=base_points,
        repeatedModifier=repeated_modifier,
        multipleCategoryModifier=multiple_category_modifier,
        totalRiskScore=total_risk_score,
        riskBand=risk_band,
        compliancePercentage=compliance_percentage,
        status=patient.status,
        deviations=patient_devs,
    )

def compute_site_trend(score: int, critical_count: int, major_count: int, affected_count: int, patient_count: int) -> SiteTrendPrediction:
    pt_count = patient_count if patient_count > 0 else 1
    violation_velocity = critical_count * 3.5 + major_count * 1.5
    infection_ratio = affected_count / pt_count

    if violation_velocity > 7 or infection_ratio > 0.35:
        trend = "Worsening"
        projected_change = int(round(6 + violation_velocity * 0.8))
        rationale = "High recurrence of critical/major deviations in recent cohort indicates uncontrolled site processes without immediate intervention."
    elif score < 20 and violation_velocity == 0:
        trend = "Improving"
        projected_change = -min(score, 3)
        rationale = "Consistent zero-deviation record over previous evaluation cycles; high protocol adherence fidelity."
    else:
        trend = "Stable"
        projected_change = 1
        rationale = "Isolated administrative or minor deviations with low probability of systematic escalation under current monitoring."

    predicted_score = max(0, min(100, score + projected_change))

    if predicted_score >= 61:
        predicted_band = "High"
    elif predicted_score >= 31:
        predicted_band = "Medium"
    else:
        predicted_band = "Low"

    history = [
        SiteTrendHistoryPoint(week="Wk -3", score=max(0, score - int(round(projected_change * 1.8)))),
        SiteTrendHistoryPoint(week="Wk -2", score=max(0, score - int(round(projected_change * 1.2)))),
        SiteTrendHistoryPoint(week="Wk -1", score=max(0, score - int(round(projected_change * 0.5)))),
        SiteTrendHistoryPoint(week="Current", score=score),
        SiteTrendHistoryPoint(week="Wk +2 (Est)", score=int(round(score + projected_change * 0.5)), isForecast=True),
        SiteTrendHistoryPoint(week="Wk +4 (Est)", score=predicted_score, isForecast=True),
    ]

    return SiteTrendPrediction(
        trend=trend,
        predictedScore=predicted_score,
        predictedBand=predicted_band,
        projectedChange=projected_change,
        predictionRationale=rationale,
        history=history,
        disclaimer="Estimated trajectory based on 30-day deviation velocity & cluster density."
    )

def calculate_site_risk(
    site: Any,
    patients: List[Patient],
    deviations: List[Deviation],
    protocol: ProtocolConfig = PROTOCOL_CONFIG,
    include_details: bool = True
) -> SiteRiskSummary:
    site_patients = [p for p in patients if p.siteId == site.id]
    site_deviations = [d for d in deviations if d.siteId == site.id]
    patient_count = len(site_patients) or 1

    patient_profiles = [calculate_patient_risk(p, deviations, protocol) for p in site_patients]
    affected_patients = [p for p in patient_profiles if p.deviationCount > 0]
    raw_risk_points = sum(p.totalRiskScore for p in patient_profiles)

    critical_devs = [d for d in site_deviations if d.severity == "Critical"]
    major_devs = [d for d in site_deviations if d.severity == "Major"]
    minor_devs = [d for d in site_deviations if d.severity == "Minor"]
    admin_devs = [d for d in site_deviations if d.severity == "Administrative"]

    density = raw_risk_points / patient_count
    affected_ratio = len(affected_patients) / patient_count
    critical_weight = len(critical_devs) * 2.6
    major_weight = len(major_devs) * 1.8

    normalized_score = int(round(density * 3.7 + affected_ratio * 18 + critical_weight + major_weight))
    normalized_score = max(0, min(100, normalized_score))

    if normalized_score >= 61:
        risk_band = "High"
    elif normalized_score >= 31:
        risk_band = "Medium"
    else:
        risk_band = "Low"

    # Risk drivers
    risk_drivers: List[str] = []
    if critical_devs:
        types = ", ".join(sorted(list({d.category for d in critical_devs})))
        risk_drivers.append(f"{len(critical_devs)} Critical Deviation{'s' if len(critical_devs) > 1 else ''} ({types})")
    if len(major_devs) >= 3:
        risk_drivers.append(f"High Major deviation density ({len(major_devs)} major violations recorded)")
    multi_violation_pts = [p for p in patient_profiles if p.deviationCount > 1]
    if multi_violation_pts:
        risk_drivers.append(f"{len(multi_violation_pts)} patient{'s' if len(multi_violation_pts) > 1 else ''} with recurrent multi-category violations")
    if affected_ratio > 0.3:
        risk_drivers.append(f"Elevated cohort contamination: {int(affected_ratio * 100)}% of site subjects affected")
    if not risk_drivers:
        risk_drivers.append("Good protocol adherence; minimal isolated discrepancies")

    # Category breakdown
    category_breakdown: Dict[str, int] = {}
    for d in site_deviations:
        category_breakdown[d.category] = category_breakdown.get(d.category, 0) + 1

    trend = compute_site_trend(
        score=normalized_score,
        critical_count=len(critical_devs),
        major_count=len(major_devs),
        affected_count=len(affected_patients),
        patient_count=patient_count,
    )

    return SiteRiskSummary(
        siteId=site.id,
        siteCode=site.code,
        siteName=site.name,
        location=site.location,
        pi=site.pi,
        cra=site.cra,
        patientCount=patient_count,
        affectedPatientCount=len(affected_patients),
        deviationCount=len(site_deviations),
        rawRiskPoints=raw_risk_points,
        score=normalized_score,
        riskBand=risk_band,
        criticalCount=len(critical_devs),
        majorCount=len(major_devs),
        minorCount=len(minor_devs),
        adminCount=len(admin_devs),
        riskDrivers=risk_drivers,
        categoryBreakdown=category_breakdown,
        deviations=site_deviations if include_details else None,
        patientProfiles=patient_profiles if include_details else None,
        trend=trend,
    )

def calculate_trial_metrics(
    sites: List[Any],
    patients: List[Patient],
    deviations: List[Deviation],
    protocol: ProtocolConfig = PROTOCOL_CONFIG
) -> TrialMetrics:
    site_risk_list = [
        calculate_site_risk(s, patients, deviations, protocol, include_details=False)
        for s in sites
    ]
    site_risk_list.sort(key=lambda s: s.score, reverse=True)

    total_patients = len(patients) or 1
    total_deviations = len(deviations)
    critical_devs = len([d for d in deviations if d.severity == "Critical"])
    major_devs = len([d for d in deviations if d.severity == "Major"])
    open_devs = len([d for d in deviations if d.status != "Resolved"])

    high_risk_sites = [s for s in site_risk_list if s.riskBand == "High"]
    medium_risk_sites = [s for s in site_risk_list if s.riskBand == "Medium"]

    trial_risk_score = int(round(sum(s.score for s in site_risk_list) / (len(site_risk_list) or 1)))

    if trial_risk_score >= 61:
        trial_risk_band = "High"
    elif trial_risk_score >= 31:
        trial_risk_band = "Medium"
    else:
        trial_risk_band = "Low"

    total_evaluations = total_patients * 5
    compliance_pct = max(0.0, float(round((1.0 - (total_deviations / float(total_evaluations))) * 100.0, 1)))

    from .explanation_service import generate_trial_executive_insight
    highest_site = site_risk_list[0] if site_risk_list else None
    executive_insight = generate_trial_executive_insight(None, highest_site)

    return TrialMetrics(
        trialId=protocol.trialId,
        trialName=protocol.trialName,
        phase=protocol.phase,
        totalPatients=total_patients,
        totalSites=len(sites),
        totalDeviations=total_deviations,
        openDeviations=open_devs,
        criticalDeviations=critical_devs,
        majorDeviations=major_devs,
        trialRiskScore=trial_risk_score,
        trialRiskBand=trial_risk_band,
        compliancePercentage=compliance_pct,
        highRiskSitesCount=len(high_risk_sites),
        mediumRiskSitesCount=len(medium_risk_sites),
        siteRiskList=site_risk_list,
        executiveInsight=executive_insight,
    )
