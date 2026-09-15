"""TrialGuard AI — Corrective and Preventive Action (CAPA) Engine.

Deterministically synthesizes CAPA candidates when:
1. A Critical deviation occurs
2. A Major deviation occurs
3. A clinical site reaches High Risk (score >= 61)

Adheres strictly to GCP E6(R2) §5.20 and 21 CFR 312:
- Zero LLM hallucinations; 100% deterministic clinical templates
- Structured root-cause hypotheses (5-Whys), corrective actions, and preventive measures
- Explicit humanReviewRequired = True
- Preserves existing approved/active CAPAs across re-analyses
- Gracefully marks obsolete/resolved CAPAs if triggering deviation is corrected
"""
from datetime import datetime, timezone
from typing import List, Any, Optional, Dict
from ..models.deviation import Deviation
from ..models.capa import CAPA, CAPAComment, CAPAActionItem

def create_capa_for_deviation(dev: Deviation, site_name: str = "Trial Site", capa_id: Optional[str] = None) -> CAPA:
    """Deterministically creates a single CAPA candidate for an individual Critical or Major deviation."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cid = capa_id or f"CAPA-{dev.id}"
    dtype = getattr(dev, "type", "") or getattr(dev, "deviationType", "")

    if dtype == "INCORRECT_DOSE":
        return CAPA(
            id=cid,
            siteId=dev.siteId,
            siteName=site_name,
            title=f"Investigational Product Dispensation & Dosing Discrepancy ({dev.siteId})",
            category="Pharmacy & Investigational Product",
            linkedDeviationIds=[dev.id],
            linkedDeviationsCount=1,
            affectedPatients=[dev.patientId] if dev.patientId else [],
            patientId=dev.patientId,
            problemStatement=f"Investigational product dispensed or documented at non-protocol dose for participant {dev.patientId}: {dev.actual}. Protocol target is 100mg once daily.",
            evidence=f"{dev.patientId}: {dev.actual}",
            rootCauseHypothesis="Pharmacy dispensation error or transcription mismatch in eCRF: Kit label ambiguity or absence of two-person verification during investigational drug release.",
            correctiveAction="1. Quarantine erroneous IP bottle batches at clinical pharmacy.\n2. Re-dispense verified 100mg blister cards to affected subject.\n3. Conduct safety call and pharmacokinetic blood sampling.",
            preventiveAction="1. Implement two-person pharmacist dual-verification protocol before any IP release.\n2. Update pharmacy standard operating procedure with barcode verification.",
            owner="Investigational Pharmacy Director",
            suggestedOwner="Investigational Pharmacy Director",
            dueDate="2026-02-28",
            priority="Critical" if dev.severity == "Critical" else "High",
            status="Pending Review",
            humanReviewRequired=True,
            createdDate=today_str,
            lastUpdated=today_str,
            comments=[
                CAPAComment(
                    author="TrialGuard Compliance Copilot",
                    role="Automated Rule Engine",
                    date=today_str,
                    text=f"Dosing deviation flagged: {dev.actual}."
                )
            ]
        )
    elif dtype == "PROHIBITED_CONMED":
        return CAPA(
            id=cid,
            siteId=dev.siteId,
            siteName=site_name,
            title=f"Administration of Contraindicated Concomitant Therapies ({dev.siteId})",
            category="Patient Safety & Medication Oversight",
            linkedDeviationIds=[dev.id],
            linkedDeviationsCount=1,
            affectedPatients=[dev.patientId] if dev.patientId else [],
            patientId=dev.patientId,
            problemStatement=f"Prohibited concomitant medication administered to participant {dev.patientId}: {dev.actual}, creating acute pharmacokinetic and cardiac risk.",
            evidence=f"{dev.patientId}: {dev.actual}",
            rootCauseHypothesis="External community sub-specialists prescribed contraindicated therapy without consulting trial card or notifying clinical trial investigative team.",
            correctiveAction="1. Immediately discontinue prohibited therapy under Medical Monitor supervision.\n2. Conduct urgent 12-lead ECG and QTc interval measurement.\n3. File formal 24-hour Serious Adverse Event / Critical Deviation notification.",
            preventiveAction="1. Re-issue participant wallet cards identifying prohibited substances in bold warnings.\n2. Institute mandatory telephone conmed screening prior to every prescription refill.",
            owner="Medical Monitor / Lead Pharmacovigilance Officer",
            suggestedOwner="Medical Monitor",
            dueDate="2026-02-24",
            priority="Critical",
            status="Pending Review",
            humanReviewRequired=True,
            createdDate=today_str,
            lastUpdated=today_str,
            comments=[
                CAPAComment(
                    author="TrialGuard Compliance Copilot",
                    role="Automated Rule Engine",
                    date=today_str,
                    text="Critical priority: Contraindicated metabolic pathway competition detected."
                )
            ]
        )
    elif dtype in ["VISIT_WINDOW_EXCEEDED", "MISSED_VISIT", "VISIT_TOO_EARLY"]:
        return CAPA(
            id=cid,
            siteId=dev.siteId,
            siteName=site_name,
            title=f"Visit Window Non-Compliance & Patient Appointment Attrition ({dev.siteId})",
            category="Visit Adherence & Retention",
            linkedDeviationIds=[dev.id],
            linkedDeviationsCount=1,
            affectedPatients=[dev.patientId] if dev.patientId else [],
            patientId=dev.patientId,
            problemStatement=f"Participant {dev.patientId} attended visit out-of-window ({dev.actual}). Scheduling controls failed to conduct visit within allowable window.",
            evidence=f"{dev.patientId}: {dev.actual}",
            rootCauseHypothesis="Investigate scheduling/site coordination: Breakdown of calendar synchronization between clinic electronic medical records and EDC scheduling alert tool.",
            correctiveAction="1. Re-contact participant for immediate vital signs and safety assessment.\n2. Re-align subsequent visit dates to protocol baseline calendar.\n3. Complete protocol deviation submission forms in eCRF.",
            preventiveAction="1. Mandate automated electronic calendar alerts 72 hours prior to opening of study visit windows.\n2. Conduct retraining of study coordinators on Section 4.2 visit window rules.\n3. Implement weekly CRA pre-visit checklist verification.",
            owner="Principal Investigator / Lead CRA",
            suggestedOwner="Principal Investigator",
            dueDate="2026-03-01",
            priority="Critical" if dtype == "MISSED_VISIT" or dev.severity == "Critical" else "High",
            status="Pending Review",
            humanReviewRequired=True,
            createdDate=today_str,
            lastUpdated=today_str,
            comments=[
                CAPAComment(
                    author="TrialGuard Compliance Copilot",
                    role="Automated Rule Engine",
                    date=today_str,
                    text=f"Visit scheduling deviation flagged: {dev.actual}."
                )
            ]
        )
    elif dtype == "MISSING_MANDATORY_LAB":
        return CAPA(
            id=cid,
            siteId=dev.siteId,
            siteName=site_name,
            title=f"Omission of Mandatory Pre-Visit Complete Blood Count (CBC) Panels ({dev.siteId})",
            category="Laboratory Safety Oversight",
            linkedDeviationIds=[dev.id],
            linkedDeviationsCount=1,
            affectedPatients=[dev.patientId] if dev.patientId else [],
            patientId=dev.patientId,
            problemStatement=f"Participant {dev.patientId} completed study visit evaluations without mandatory CBC differential collection logged in central laboratory portal.",
            evidence=f"{dev.patientId}: {dev.actual}",
            rootCauseHypothesis="Investigate laboratory workflow: Site phlebotomy requisition templates lacked mandatory pre-printed checkbox for protocol-specific CBC differential collection tube.",
            correctiveAction="1. Schedule priority home-health or clinic blood draw within 48 hours for affected participant.\n2. Verify absence of cytopenia or hematologic toxicity upon receipt of results.",
            preventiveAction="1. Redesign pre-packaged laboratory kits with color-coded tube requisitions.\n2. Enforce EDC hard-stop preventing visit completion without CBC requisition accession number.",
            owner="Central Lab Coordinator / Principal Investigator",
            suggestedOwner="Principal Investigator",
            dueDate="2026-03-05",
            priority="High",
            status="Pending Review",
            humanReviewRequired=True,
            createdDate=today_str,
            lastUpdated=today_str,
            comments=[
                CAPAComment(
                    author="TrialGuard Compliance Copilot",
                    role="Automated Rule Engine",
                    date=today_str,
                    text="Mandatory safety laboratory gap identified."
                )
            ]
        )
    else:
        return CAPA(
            id=cid,
            siteId=dev.siteId,
            siteName=site_name,
            title=f"Protocol Deviation Quality Remediation ({dev.category} - {dev.siteId})",
            category=dev.category or "Protocol Compliance",
            linkedDeviationIds=[dev.id],
            linkedDeviationsCount=1,
            affectedPatients=[dev.patientId] if dev.patientId else [],
            patientId=dev.patientId,
            problemStatement=f"Protocol deviation identified: {dev.actual}. Expected: {dev.expected}.",
            evidence=dev.evidence or dev.actual,
            rootCauseHypothesis=dev.explanation or "Site operational deviation requiring investigator corrective action.",
            correctiveAction=dev.recommendedAction or "Retrain site coordinators and file deviation report.",
            preventiveAction="Implement pre-visit checklist verification and electronic EHR protocol reminders.",
            owner="Principal Investigator",
            suggestedOwner="Principal Investigator",
            dueDate="2026-03-10",
            priority="Critical" if dev.severity == "Critical" else "High" if dev.severity == "Major" else "Medium",
            status="Pending Review",
            humanReviewRequired=True,
            createdDate=today_str,
            lastUpdated=today_str,
            comments=[
                CAPAComment(
                    author="TrialGuard Compliance Copilot",
                    role="Automated Rule Engine",
                    date=today_str,
                    text=f"CAPA triggered from {dev.severity} deviation: {dev.id}."
                )
            ]
        )

def create_capa_for_site_risk(site: Any, site_devs: List[Deviation], capa_id: Optional[str] = None) -> CAPA:
    """Deterministically creates a site quality escalation CAPA when a site reaches high risk."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    s_id = site.siteId if hasattr(site, "siteId") else getattr(site, "id", "SITE-001")
    s_name = site.siteName if hasattr(site, "siteName") else getattr(site, "name", s_id)
    s_score = site.score if hasattr(site, "score") else getattr(site, "risk_score", 0)
    s_pi = site.pi if hasattr(site, "pi") else "Principal Investigator"
    cid = capa_id or f"CAPA-{s_id}-RISK"

    affected_pts = sorted(list({d.patientId for d in site_devs if d.patientId}))
    crit_count = len([d for d in site_devs if d.severity == "Critical"])
    maj_count = len([d for d in site_devs if d.severity == "Major"])

    return CAPA(
        id=cid,
        siteId=s_id,
        siteName=s_name,
        title=f"Systemic Quality Oversight & High-Risk Site Escalation ({s_id})",
        category="Site Governance & Quality Oversight",
        linkedDeviationIds=[d.id for d in site_devs],
        linkedDeviationsCount=len(site_devs),
        affectedPatients=affected_pts,
        patientId=affected_pts[0] if affected_pts else None,
        problemStatement=(
            f"Site {s_id} reached High Risk status with a risk score of {s_score}/100. "
            f"Accumulation of {crit_count} Critical and {maj_count} Major deviations across "
            f"{len(affected_pts)} subjects indicates systemic breakdown in site protocol compliance."
        ),
        evidence=(
            f"Elevated risk score ({s_score}/100) exceeding trial threshold (60). "
            f"Documented violations across {len(site_devs)} protocol events."
        ),
        rootCauseHypothesis=(
            "Comprehensive site operational strain: coordinator turnover, lack of dedicated trial calendar tracking, "
            "and failure of secondary sign-off on critical trial milestones."
        ),
        correctiveAction=(
            "1. Dispatch Lead CRA for mandatory on-site GCP audit within 5 business days.\n"
            "2. Perform 100% Source Data Verification (SDV) on all active participants.\n"
            "3. Implement immediate investigator corrective action plan."
        ),
        preventiveAction=(
            "1. Conduct mandatory protocol retraining for all site personnel.\n"
            "2. Institute weekly quality monitoring calls with Lead CRA.\n"
            "3. Restrict enrollment until formal remediation audit is approved."
        ),
        owner=f"{s_pi} / Lead CRA",
        suggestedOwner=s_pi,
        dueDate="2026-03-05",
        priority="Critical" if s_score >= 80 else "High",
        status="Pending Review",
        humanReviewRequired=True,
        createdDate=today_str,
        lastUpdated=today_str,
        comments=[
            CAPAComment(
                author="TrialGuard Compliance Copilot",
                role="Automated Risk Engine",
                date=today_str,
                text=f"High risk trigger: Site score {s_score}/100 exceeded regulatory monitoring threshold."
            )
        ]
    )

def generate_capas_from_deviations(
    deviations: Optional[List[Deviation]] = None,
    site_risks: Optional[List[Any]] = None,
    existing_capas: Optional[List[CAPA]] = None,
    sites_map: Optional[Dict[str, Any]] = None,
    current_deviations: Optional[List[Deviation]] = None
) -> List[CAPA]:
    """Generates deterministic CAPAs for Critical/Major deviations and High-Risk sites."""
    deviations = deviations if deviations is not None else (current_deviations or [])
    site_risks = site_risks or []
    active_dev_map = {d.id: d for d in deviations}
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Map of existing CAPAs by unique key to maintain persistence and user edits
    existing_by_key: Dict[str, CAPA] = {}
    preserved_capas: List[CAPA] = []

    if existing_capas:
        for c in existing_capas:
            key = f"{c.siteId}:{c.category}"
            existing_by_key[key] = c

            # If CAPA is Approved, In Progress, Completed, or Rejected: ALWAYS preserve it!
            if c.status in ["Approved", "In Progress", "Completed", "Rejected"]:
                # Check if triggering deviations still exist
                still_active = any(dev_id in active_dev_map for dev_id in c.linkedDeviationIds)
                if not still_active and c.status == "In Progress":
                    # Note in comments that deviations were resolved
                    has_noted = any("resolved via eCRF" in cm.text for cm in c.comments)
                    if not has_noted:
                        c.comments.append(
                            CAPAComment(
                                author="TrialGuard Engine",
                                role="System Automator",
                                date=today_str,
                                text="Triggering protocol deviation(s) resolved via eCRF reconciliation."
                            )
                        )
                preserved_capas.append(c)
            else:
                # Draft / Pending Review: Check if deviations still exist
                still_active = any(dev_id in active_dev_map for dev_id in c.linkedDeviationIds)
                if not still_active and c.linkedDeviationIds:
                    # Deviation was corrected! Mark CAPA as Completed/Resolved rather than deleting
                    c.status = "Completed"
                    c.lastUpdated = today_str
                    c.comments.append(
                        CAPAComment(
                            author="TrialGuard Engine",
                            role="System Automator",
                            date=today_str,
                            text="Triggering deviation resolved via eCRF reconciliation. CAPA candidate successfully closed."
                        )
                    )
                    preserved_capas.append(c)

    capa_num = len(preserved_capas) + 1
    def next_capa_id() -> str:
        nonlocal capa_num
        cid = f"CAPA-2026-{capa_num:03d}"
        capa_num += 1
        return cid

    new_generated_capas: List[CAPA] = []
    generated_keys = {f"{c.siteId}:{c.category}" for c in preserved_capas}

    # Group deviations by site
    site_map = {s.siteId if hasattr(s, "siteId") else s.id: s for s in site_risks}
    site_devs: Dict[str, List[Deviation]] = {}
    for d in deviations:
        site_devs.setdefault(d.siteId, []).append(d)

    # 1. Evaluate Site-Level High Risk CAPAs (score >= 61)
    for s in site_risks:
        s_id = s.siteId if hasattr(s, "siteId") else s.id
        s_name = s.siteName if hasattr(s, "siteName") else s.name
        s_score = s.score if hasattr(s, "score") else 0
        s_pi = s.pi if hasattr(s, "pi") else "Principal Investigator"
        key = f"{s_id}:Site Governance & Quality Oversight"

        if s_score >= 61 and key not in generated_keys:
            devs_at_site = site_devs.get(s_id, [])
            affected_pts = sorted(list({d.patientId for d in devs_at_site}))
            crit_count = len([d for d in devs_at_site if d.severity == "Critical"])
            maj_count = len([d for d in devs_at_site if d.severity == "Major"])

            capa = CAPA(
                id=next_capa_id(),
                siteId=s_id,
                siteName=s_name,
                title=f"Systemic Quality Oversight & High-Risk Site Escalation ({s_id})",
                category="Site Governance & Quality Oversight",
                linkedDeviationIds=[d.id for d in devs_at_site],
                linkedDeviationsCount=len(devs_at_site),
                affectedPatients=affected_pts,
                patientId=affected_pts[0] if affected_pts else None,
                problemStatement=(
                    f"Site {s_id} reached High Risk status with a risk score of {s_score}/100. "
                    f"Accumulation of {crit_count} Critical and {maj_count} Major deviations across "
                    f"{len(affected_pts)} subjects indicates systemic breakdown in site protocol compliance."
                ),
                evidence=(
                    f"Elevated risk score ({s_score}/100) exceeding trial threshold (60). "
                    f"Documented violations across {len(devs_at_site)} protocol events."
                ),
                rootCauseHypothesis=(
                    "Comprehensive site operational strain: coordinator turnover, lack of dedicated trial calendar tracking, "
                    "and failure of secondary sign-off on critical trial milestones."
                ),
                correctiveAction=(
                    "1. Dispatch Lead CRA for mandatory on-site GCP audit within 5 business days.\n"
                    "2. Perform 100% Source Data Verification (SDV) on all active participants.\n"
                    "3. Implement immediate investigator corrective action plan."
                ),
                preventiveAction=(
                    "1. Conduct mandatory protocol retraining for all site personnel.\n"
                    "2. Institute weekly quality monitoring calls with Lead CRA.\n"
                    "3. Restrict enrollment until formal remediation audit is approved."
                ),
                owner=f"{s_pi} / Lead CRA",
                suggestedOwner=s_pi,
                dueDate="2026-03-05",
                priority="Critical",
                status="Pending Review",
                humanReviewRequired=True,
                createdDate=today_str,
                lastUpdated=today_str,
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Risk Engine",
                        date=today_str,
                        text=f"High risk trigger: Site score {s_score}/100 exceeded regulatory monitoring threshold."
                    )
                ]
            )
            new_generated_capas.append(capa)
            generated_keys.add(key)

    # 2. Evaluate Specific Deviation Clusters (Critical & Major)
    for s_id, d_list in site_devs.items():
        s_info = site_map.get(s_id)
        s_name = s_info.siteName if s_info and hasattr(s_info, "siteName") else s_id
        s_pi = s_info.pi if s_info and hasattr(s_info, "pi") else "Principal Investigator"
        s_cra = s_info.cra if s_info and hasattr(s_info, "cra") else "Lead CRA"

        # A. Investigational Product Dosing Deviations
        dose_devs = [d for d in d_list if d.type == "INCORRECT_DOSE"]
        key_dose = f"{s_id}:Pharmacy & Investigational Product"
        if dose_devs and key_dose not in generated_keys:
            affected_pts = sorted(list({d.patientId for d in dose_devs}))
            evidence_lines = [f"{d.patientId}: {d.actual}" for d in dose_devs]
            has_crit = any(d.severity == "Critical" for d in dose_devs)

            capa = CAPA(
                id=next_capa_id(),
                siteId=s_id,
                siteName=s_name,
                title=f"Investigational Product Dispensation & Dosing Discrepancy ({s_id})",
                category="Pharmacy & Investigational Product",
                linkedDeviationIds=[d.id for d in dose_devs],
                linkedDeviationsCount=len(dose_devs),
                affectedPatients=affected_pts,
                patientId=affected_pts[0] if affected_pts else None,
                problemStatement=(
                    f"Investigational product dispensed or documented at non-protocol doses for participant(s) "
                    f"{', '.join(affected_pts)} at site {s_id}. Protocol target is 100mg once daily."
                ),
                evidence="; ".join(evidence_lines),
                rootCauseHypothesis=(
                    "Pharmacy dispensation error or transcription mismatch in eCRF: Kit label ambiguity "
                    "or absence of two-person verification during investigational drug release."
                ),
                correctiveAction=(
                    "1. Quarantine erroneous IP bottle batches at clinical pharmacy.\n"
                    "2. Re-dispense verified 100mg blister cards to affected subjects.\n"
                    "3. Conduct safety call and pharmacokinetic blood sampling."
                ),
                preventiveAction=(
                    "1. Implement two-person pharmacist dual-verification protocol before any IP release.\n"
                    "2. Update pharmacy standard operating procedure with barcode verification."
                ),
                owner=f"Investigational Pharmacy Director / {s_pi}",
                suggestedOwner=s_pi,
                dueDate="2026-02-28",
                priority="Critical" if has_crit else "High",
                status="Pending Review",
                humanReviewRequired=True,
                createdDate=today_str,
                lastUpdated=today_str,
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Rule Engine",
                        date=today_str,
                        text="Dosing deviation flagged. Dosage discrepancy exceeds protocol-acceptable limits."
                    )
                ]
            )
            new_generated_capas.append(capa)
            generated_keys.add(key_dose)

        # B. Prohibited Concomitant Medications
        proh_devs = [d for d in d_list if d.type == "PROHIBITED_CONMED"]
        key_proh = f"{s_id}:Patient Safety & Medication Oversight"
        if proh_devs and key_proh not in generated_keys:
            affected_pts = sorted(list({d.patientId for d in proh_devs}))
            evidence_lines = [f"{d.patientId}: {d.actual}" for d in proh_devs]

            capa = CAPA(
                id=next_capa_id(),
                siteId=s_id,
                siteName=s_name,
                title=f"Administration of Contraindicated Concomitant Therapies ({s_id})",
                category="Patient Safety & Medication Oversight",
                linkedDeviationIds=[d.id for d in proh_devs],
                linkedDeviationsCount=len(proh_devs),
                affectedPatients=affected_pts,
                patientId=affected_pts[0] if affected_pts else None,
                problemStatement=(
                    f"Prohibited concomitant medication administered to participant(s) {', '.join(affected_pts)} "
                    "while receiving investigational drug therapy, creating acute pharmacokinetic and cardiac risk."
                ),
                evidence="; ".join(evidence_lines),
                rootCauseHypothesis=(
                    "External community sub-specialists prescribed contraindicated therapy without consulting trial "
                    "card or notifying clinical trial investigative team."
                ),
                correctiveAction=(
                    "1. Immediately discontinue prohibited therapy under Medical Monitor supervision.\n"
                    "2. Conduct urgent 12-lead ECG and QTc interval measurement.\n"
                    "3. File formal 24-hour Serious Adverse Event / Critical Deviation notification."
                ),
                preventiveAction=(
                    "1. Re-issue participant wallet cards identifying prohibited substances in bold warnings.\n"
                    "2. Institute mandatory telephone conmed screening prior to every prescription refill."
                ),
                owner="Medical Monitor / Lead Pharmacovigilance Officer",
                suggestedOwner="Medical Monitor",
                dueDate="2026-02-24",
                priority="Critical",
                status="Pending Review",
                humanReviewRequired=True,
                createdDate=today_str,
                lastUpdated=today_str,
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Rule Engine",
                        date=today_str,
                        text="Critical priority: Contraindicated metabolic pathway competition detected."
                    )
                ]
            )
            new_generated_capas.append(capa)
            generated_keys.add(key_proh)

        # C. Visit Window Lapses & Missed Visits
        window_devs = [
            d for d in d_list
            if d.type in ["VISIT_WINDOW_EXCEEDED", "MISSED_VISIT", "VISIT_TOO_EARLY"]
        ]
        key_win = f"{s_id}:Visit Adherence & Retention"
        # Trigger if critical missed visit, any Critical/Major deviation, or >= 2 window exceedances
        if (any(d.type == "MISSED_VISIT" or d.severity in ["Critical", "Major"] for d in window_devs) or len(window_devs) >= 2) and key_win not in generated_keys:
            affected_pts = sorted(list({d.patientId for d in window_devs}))
            evidence_lines = [f"{d.patientId}: {d.actual}" for d in window_devs]
            has_missed = any(d.type == "MISSED_VISIT" for d in window_devs)

            capa = CAPA(
                id=next_capa_id(),
                siteId=s_id,
                siteName=s_name,
                title=f"Visit Window Non-Compliance & Patient Appointment Attrition ({s_id})",
                category="Visit Adherence & Retention",
                linkedDeviationIds=[d.id for d in window_devs],
                linkedDeviationsCount=len(window_devs),
                affectedPatients=affected_pts,
                patientId=affected_pts[0] if affected_pts else None,
                problemStatement=(
                    f"Site {s_id} demonstrated recurrent protocol visit window breaches affecting {len(affected_pts)} "
                    f"participant(s) ({', '.join(affected_pts)}). Scheduling controls failed to conduct visits within allowable windows."
                ),
                evidence="; ".join(evidence_lines),
                rootCauseHypothesis=(
                    "Investigate scheduling/site coordination: Breakdown of calendar synchronization between clinic "
                    "electronic medical records and EDC scheduling alert tool."
                ),
                correctiveAction=(
                    "1. Re-contact all out-of-window participants for immediate vital signs and safety assessment.\n"
                    "2. Re-align subsequent visit dates to protocol baseline calendar.\n"
                    "3. Complete protocol deviation submission forms in eCRF."
                ),
                preventiveAction=(
                    "1. Mandate automated electronic calendar alerts 72 hours prior to opening of study visit windows.\n"
                    "2. Conduct retraining of study coordinators on Section 4.2 visit window rules.\n"
                    "3. Implement weekly CRA pre-visit checklist verification."
                ),
                owner=f"{s_pi} / {s_cra}",
                suggestedOwner=s_pi,
                dueDate="2026-03-01",
                priority="Critical" if has_missed else "High",
                status="Pending Review",
                humanReviewRequired=True,
                createdDate=today_str,
                lastUpdated=today_str,
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Rule Engine",
                        date=today_str,
                        text=f"Visit scheduling cluster detected: {len(window_devs)} window deviations active."
                    )
                ]
            )
            new_generated_capas.append(capa)
            generated_keys.add(key_win)

        # D. Missing Mandatory Safety Labs (CBC)
        lab_devs = [d for d in d_list if d.type == "MISSING_MANDATORY_LAB"]
        key_lab = f"{s_id}:Laboratory Safety Oversight"
        if lab_devs and key_lab not in generated_keys:
            affected_pts = sorted(list({d.patientId for d in lab_devs}))
            evidence_lines = [f"{d.patientId}: {d.actual}" for d in lab_devs]

            capa = CAPA(
                id=next_capa_id(),
                siteId=s_id,
                siteName=s_name,
                title=f"Omission of Mandatory Pre-Visit 3 Complete Blood Count (CBC) Panels ({s_id})",
                category="Laboratory Safety Oversight",
                linkedDeviationIds=[d.id for d in lab_devs],
                linkedDeviationsCount=len(lab_devs),
                affectedPatients=affected_pts,
                patientId=affected_pts[0] if affected_pts else None,
                problemStatement=(
                    f"Participant(s) {', '.join(affected_pts)} at site {s_id} completed Visit 3 evaluations without mandatory "
                    "CBC with differential panels collected or logged in central laboratory portal."
                ),
                evidence="; ".join(evidence_lines),
                rootCauseHypothesis=(
                    "Investigate laboratory workflow: Site phlebotomy requisition templates lacked mandatory pre-printed "
                    "checkbox for protocol-specific CBC differential collection tube."
                ),
                correctiveAction=(
                    "1. Schedule priority home-health or clinic blood draw within 48 hours for affected participants.\n"
                    "2. Verify absence of cytopenia or hematologic toxicity upon receipt of results."
                ),
                preventiveAction=(
                    "1. Redesign pre-packaged Visit 3 laboratory kits with color-coded tube requisitions.\n"
                    "2. Enforce EDC hard-stop preventing Visit 3 completion without CBC requisition accession number."
                ),
                owner=f"Central Lab Coordinator / {s_pi}",
                suggestedOwner=s_pi,
                dueDate="2026-03-05",
                priority="High",
                status="Pending Review",
                humanReviewRequired=True,
                createdDate=today_str,
                lastUpdated=today_str,
                comments=[
                    CAPAComment(
                        author="TrialGuard Compliance Copilot",
                        role="Automated Rule Engine",
                        date=today_str,
                        text="Mandatory safety laboratory gap identified prior to primary efficacy endpoint visit."
                    )
                ]
            )
            new_generated_capas.append(capa)
            generated_keys.add(key_lab)

    # Combine preserved and newly generated CAPAs
    all_capas = preserved_capas + new_generated_capas
    return all_capas
