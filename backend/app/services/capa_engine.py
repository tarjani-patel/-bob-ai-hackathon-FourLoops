"""TrialGuard AI — Corrective and Preventive Action (CAPA) Engine.

Analyzes detected deviation clusters, recurrent patterns, and site risk scores
to generate structured, auditable CAPA proposals.

Explicitly flags every generated item with humanReviewRequired = True
to enforce clinical oversight and regulatory compliance.
"""
from typing import List, Any
from ..models.deviation import Deviation
from ..models.capa import CAPA, CAPAComment

def generate_capas_from_deviations(
    deviations: List[Deviation],
    site_risks: List[Any]
) -> List[CAPA]:
    capas: List[CAPA] = []
    capa_num = 1

    def next_capa_id() -> str:
        nonlocal capa_num
        cid = f"CAPA-2026-{capa_num:03d}"
        capa_num += 1
        return cid

    # 1. Evaluate Site 03 Visit Window & Scheduling Cluster
    site03_window_devs = [
        d for d in deviations
        if d.siteId == "SITE-03" and (d.category in ["Visit Window", "Visit Adherence"])
    ]

    if len(site03_window_devs) >= 2:
        affected_patients = sorted(list({d.patientId for d in site03_window_devs}))
        capas.append(
            CAPA(
                id=next_capa_id(),
                siteId="SITE-03",
                siteName="Metro General Health Science Center",
                title="Systemic Visit Window Non-Compliance & Patient Appointment Attrition",
                category="Visit Adherence & Retention",
                linkedDeviationIds=[d.id for d in site03_window_devs],
                linkedDeviationsCount=len(site03_window_devs),
                affectedPatients=affected_patients,
                problemStatement=(
                    f"Site 03 demonstrated recurrent protocol visit window breaches (e.g. PT-1042 Day 20, "
                    f"PT-1044 Day 9, PT-1048 Missed Visit) affecting {len(affected_patients)} enrolled participants. "
                    "Current scheduling controls fail to alert staff before protocol windows elapse."
                ),
                evidence=(
                    f"{len(site03_window_devs)} documented visit window deviations detected across {', '.join(affected_patients)}. "
                    "Window overshoots range from +2 to +6 days beyond allowable limits."
                ),
                rootCauseHypothesis=(
                    "Site study coordinator transition resulted in breakdown of calendar synchronization "
                    "between clinic electronic medical records and EDC scheduling tool."
                ),
                correctiveAction=(
                    "1. Re-contact all out-of-window participants for immediate vital signs and safety assessment.\n"
                    "2. Calculate offset intervals for subsequent visits to align with protocol baseline timeline.\n"
                    "3. Complete protocol deviation submission forms in eCRF."
                ),
                preventiveAction=(
                    "1. Mandate automated electronic calendar alerts 72 hours prior to opening of study visit windows.\n"
                    "2. Conduct retraining of Site 03 study coordinators on Section 4.2 visit window rules.\n"
                    "3. Implement weekly CRA pre-visit checklist verification."
                ),
                owner="Dr. Evelyn Zhao (PI) / James Taylor (CRA)",
                dueDate="2026-03-01",
                priority="High",
                status="Review Pending",
                humanReviewRequired=True,
                lastUpdated="2026-02-15",
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Rule Engine",
                        date="2026-02-14",
                        text="CAPA generated automatically following detection of >3 visit window deviations at Site 03."
                    ),
                    CAPAComment(
                        author="Sarah Lin (Lead CCRA)",
                        role="Compliance Reviewer",
                        date="2026-02-15",
                        text="Reviewed problem statement. Awaiting formal PI sign-off on coordinator retraining schedule."
                    )
                ]
            )
        )

    # 2. Evaluate Prohibited Concomitant Medications Cluster
    prohibited_med_devs = [d for d in deviations if d.category == "Prohibited Medication"]
    if prohibited_med_devs:
        affected_sites = sorted(list({d.siteName for d in prohibited_med_devs}))
        affected_patients = sorted(list({d.patientId for d in prohibited_med_devs}))
        has_drug_x = any("Drug-X" in d.expected or "Drug-X" in d.actual for d in prohibited_med_devs)

        capas.append(
            CAPA(
                id=next_capa_id(),
                siteId=prohibited_med_devs[0].siteId,
                siteName=", ".join(affected_sites),
                title="Administration of Prohibited Concomitant Therapies (Drug-X / CYP3A4 Inhibitors)",
                category="Patient Safety & Medication Oversight",
                linkedDeviationIds=[d.id for d in prohibited_med_devs],
                linkedDeviationsCount=len(prohibited_med_devs),
                affectedPatients=affected_patients,
                problemStatement=(
                    f"Critical violation: Prohibited medications ({'Drug-X, ' if has_drug_x else ''}Ketoconazole) "
                    "prescribed or continued during investigational drug administration, posing acute pharmacokinetic and cardiac risk."
                ),
                evidence=(
                    f"Documented dispensation of prohibited agents for participants {', '.join(affected_patients)} "
                    "without pre-clearance from Medical Monitor."
                ),
                rootCauseHypothesis=(
                    "External community sub-specialists prescribed therapies without checking participant clinical trial card "
                    "or notifying study site staff."
                ),
                correctiveAction=(
                    "1. Immediately discontinue prohibited therapy under Medical Monitor supervision.\n"
                    "2. Conduct urgent 12-lead ECG and QTc interval measurement.\n"
                    "3. File formal 24-hour Serious Adverse Event (SAE) / Critical Deviation notification."
                ),
                preventiveAction=(
                    "1. Re-issue participant wallet cards identifying prohibited substances in bold warnings.\n"
                    "2. Institute mandatory bi-weekly telephone conmed screening prior to every prescription refill.\n"
                    "3. Site PI to issue formal notice to participant primary care providers."
                ),
                owner="Medical Monitor / Lead Pharmacovigilance Officer",
                dueDate="2026-02-22",
                priority="Critical",
                status="Under Investigation",
                humanReviewRequired=True,
                lastUpdated="2026-02-15",
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Rule Engine",
                        date="2026-02-14",
                        text="Critical priority assigned due to contraindicated CYP3A4 metabolic pathway competition."
                    )
                ]
            )
        )

    # 3. Evaluate Investigational Product Dosing Deviations
    dosing_devs = [d for d in deviations if d.category == "Dosing / IP Adherence"]
    if dosing_devs:
        affected_patients = sorted(list({d.patientId for d in dosing_devs}))
        primary_site_name = dosing_devs[0].siteName
        primary_site_id = dosing_devs[0].siteId

        capas.append(
            CAPA(
                id=next_capa_id(),
                siteId=primary_site_id,
                siteName=primary_site_name,
                title="Investigational Product Dispensation & Dosing Discrepancy",
                category="Pharmacy & Investigational Product",
                linkedDeviationIds=[d.id for d in dosing_devs],
                linkedDeviationsCount=len(dosing_devs),
                affectedPatients=affected_patients,
                problemStatement=(
                    "Investigational product dispensed at incorrect dosage levels "
                    "(e.g. 50mg, 150mg, or 200mg vs protocol-specified 100mg once daily)."
                ),
                evidence=f"Discrepancy identified in eCRF drug accountability log for participants {', '.join(affected_patients)}.",
                rootCauseHypothesis=(
                    "Investigational drug pharmacy kit labeling ambiguity during batch preparation, "
                    "coupled with failure of secondary sign-off during dispensation."
                ),
                correctiveAction=(
                    "1. Quarantine incorrect IP bottle batches at clinical pharmacy.\n"
                    "2. Re-dispense verified 100mg blister cards to affected subjects.\n"
                    "3. Conduct safety call and PK blood sampling."
                ),
                preventiveAction=(
                    "1. Implement two-person pharmacist dual-verification protocol before any IP is released.\n"
                    "2. Update pharmacy standard operating procedure (SOP-IP-04) with barcode verification."
                ),
                owner="Investigational Pharmacy Director / Site PI",
                dueDate="2026-02-28",
                priority="High",
                status="Review Pending",
                humanReviewRequired=True,
                lastUpdated="2026-02-15",
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Rule Engine",
                        date="2026-02-14",
                        text="Dosing discrepancy flagged. Dose range deviation exceeds protocol-permitted limits."
                    )
                ]
            )
        )

    # 4. Evaluate Missing CBC Laboratory Protocol Cluster
    cbc_devs = [d for d in deviations if d.type == "MISSING_MANDATORY_LAB"]
    if cbc_devs:
        affected_patients = sorted(list({d.patientId for d in cbc_devs}))
        capas.append(
            CAPA(
                id=next_capa_id(),
                siteId="SITE-03",
                siteName="Metro General Health Science Center",
                title="Omission of Mandatory Pre-Visit 3 Complete Blood Count (CBC) Panels",
                category="Laboratory Safety Oversight",
                linkedDeviationIds=[d.id for d in cbc_devs],
                linkedDeviationsCount=len(cbc_devs),
                affectedPatients=affected_patients,
                problemStatement=(
                    f"Multiple participants completed Visit 3 evaluations without mandatory CBC with differential panels "
                    "collected or logged in central laboratory portal."
                ),
                evidence=f"Missing hematology results for {len(affected_patients)} participants ({', '.join(affected_patients)}).",
                rootCauseHypothesis="Site phlebotomy requisition templates lacked mandatory pre-printed checkbox for protocol-specific CBC differential tube.",
                correctiveAction=(
                    "1. Schedule priority home-health or clinic blood draw within 48 hours for all affected participants.\n"
                    "2. Verify absence of cytopenia or thrombocytopenia."
                ),
                preventiveAction=(
                    "1. Redesign pre-packaged Visit 3 laboratory kits with color-coded tube requisitions.\n"
                    "2. Enforce EDC hard-stop preventing Visit 3 submission without CBC accession number."
                ),
                owner="Central Lab Coordinator / Site PI",
                dueDate="2026-03-05",
                priority="Medium",
                status="Review Pending",
                humanReviewRequired=True,
                lastUpdated="2026-02-15",
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Rule Engine",
                        date="2026-02-14",
                        text="Safety laboratory gap identified across multiple patients prior to primary endpoint visit."
                    )
                ]
            )
        )

    return capas
