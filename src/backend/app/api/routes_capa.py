"""Corrective and Preventive Action (CAPA) Routes."""
import csv
import io
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, status, Query, Response

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..models.capa import (
    CAPA,
    CAPACreate,
    CAPAUpdate,
    CAPAApproveRequest,
    CAPARejectRequest,
    CAPACommentRequest,
)
from ..services.compliance_engine import evaluate_compliance
from ..services.risk_engine import calculate_site_risk
from ..services.capa_engine import generate_capas_from_deviations
from ..services.rbac_service import get_current_user_context, check_site_access, check_role_permission

router = APIRouter(prefix="/api/capas", tags=["CAPA Engine"])

def ensure_capas():
    if not store.capas:
        if not store.deviations:
            all_patients = store.get_patients()
            store.deviations = evaluate_compliance(all_patients, PROTOCOL_CONFIG)
        patients = store.get_patients()
        site_risks = [calculate_site_risk(s, patients, store.deviations, PROTOCOL_CONFIG) for s in PROTOCOL_CONFIG.sites]
        store.capas = generate_capas_from_deviations(store.deviations, site_risks, existing_capas=store.capas)

@router.get("", response_model=List[CAPA])
def get_capas(
    request: Request,
    site_id: Optional[str] = Query(None, description="Filter CAPAs by site ID (e.g. SITE-03)"),
    status: Optional[str] = Query(None, description="Filter by status (Draft, Pending Review, Approved, In Progress, Completed, Rejected)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Critical, High, Medium, Low)"),
) -> List[CAPA]:
    ensure_capas()
    user_ctx = get_current_user_context(request)

    # Scoping for Site Investigator: restricted to assigned site
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        assigned_site = user_ctx.get("site_id")
        if site_id and assigned_site and site_id.upper() != assigned_site.upper():
            check_site_access(user_ctx, site_id)
        site_id = assigned_site

    return store.get_capas(site_id=site_id, status=status, priority=priority)

@router.get("/export")
def export_capa_dossier(
    request: Request,
    format: str = Query("json", description="Export format: json, csv, or doc"),
    site_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
):
    """Exports the full CAPA audit dossier in structured JSON, CSV, or formatted Word (.doc)."""
    ensure_capas()
    user_ctx = get_current_user_context(request)
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        assigned_site = user_ctx.get("site_id")
        if site_id and assigned_site and site_id.upper() != assigned_site.upper():
            check_site_access(user_ctx, site_id)
        site_id = assigned_site

    capas = store.get_capas(site_id=site_id, status=status, priority=priority)
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    store.record_audit(
        action="CAPA_DOSSIER_EXPORTED",
        performed_by=user_ctx["user_name"],
        role=user_ctx["role"],
        site_id=site_id,
        target_id=f"{len(capas)} CAPAs",
        details={"format": format, "count": len(capas), "filterSite": site_id, "filterStatus": status}
    )

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "CAPA ID", "Status", "Priority", "Site ID", "Site Name", "Patient ID",
            "Category", "Title", "Problem Statement", "Evidence",
            "Root Cause Hypothesis", "Corrective Action", "Preventive Action",
            "Owner", "Due Date", "Created Date", "Last Updated", "Linked Deviations",
            "Rejection Reason", "Human Review Required", "Comments"
        ])
        for c in capas:
            comments_parts = []
            for cm in (c.comments or []):
                author = getattr(cm, 'author', None) or (cm.get('author', 'User') if isinstance(cm, dict) else 'User')
                date_str = getattr(cm, 'date', None) or (cm.get('date', '') if isinstance(cm, dict) else '')
                text = getattr(cm, 'text', None) or (cm.get('text', '') if isinstance(cm, dict) else str(cm))
                comments_parts.append(f"[{author} ({date_str})]: {text}")
            comments_str = "; ".join(comments_parts)
            writer.writerow([
                c.id, c.status, c.priority, c.siteId, c.siteName or "", c.patientId or "",
                c.category or "", c.title or "", c.problemStatement or "", c.evidence or "",
                c.rootCauseHypothesis or "", c.correctiveAction or "", c.preventiveAction or "",
                c.suggestedOwner or c.owner or "", c.dueDate or "", c.createdDate or "", c.lastUpdated or "",
                ", ".join(c.linkedDeviationIds or []), c.rejectionReason or "",
                "Yes" if c.humanReviewRequired else "No", comments_str
            ])
        content = output.getvalue()
        filename = f"TrialGuard_CAPA_Dossier_{today_str}.csv"
        return Response(content=content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})

    elif format.lower() == "doc":
        rows_html = "".join(f"""
        <tr>
            <td style="border:1px solid #cbd5e1;padding:6px;font-family:monospace;font-weight:bold;">{c.id}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;"><span style="background:#e0f2fe;color:#0369a1;padding:2px 6px;border-radius:4px;font-weight:bold;">{c.status}</span></td>
            <td style="border:1px solid #cbd5e1;padding:6px;font-weight:bold;color:#be123c;">{c.priority}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.siteName} ({c.siteId})</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.category}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.problemStatement}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.evidence}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.rootCauseHypothesis}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.correctiveAction}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.preventiveAction}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.suggestedOwner or c.owner}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{", ".join(c.linkedDeviationIds or [])}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">{c.rejectionReason or "-"}</td>
        </tr>
        """ for c in capas)
        doc_html = f"""<!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>TrialGuard AI — CAPA Dossier</title>
        <style>
            body {{ font-family: Calibri, Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #0f172a; margin: 20pt; }}
            h1 {{ color: #1e3a8a; font-size: 18pt; border-bottom: 2pt solid #2563eb; padding-bottom: 4pt; }}
            table {{ border-collapse: collapse; width: 100%; font-size: 9pt; }}
            th {{ background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px; text-align: left; }}
        </style>
        </head>
        <body>
            <h1>TrialGuard AI — Corrective & Preventive Action (CAPA) Dossier</h1>
            <p><strong>Trial:</strong> CT-101 (Cardio-X Phase III) | <strong>Date:</strong> {today_str} | <strong>Total Plans:</strong> {len(capas)}</p>
            <table>
                <thead>
                    <tr><th>CAPA ID</th><th>Status</th><th>Priority</th><th>Site</th><th>Category</th><th>Problem Statement</th><th>Evidence</th><th>Root Cause Hypothesis</th><th>Corrective Action</th><th>Preventive Action</th><th>Owner</th><th>Linked Deviations</th><th>Rejection / Notes</th></tr>
                </thead>
                <tbody>{rows_html}</tbody>
            </table>
        </body>
        </html>"""
        filename = f"TrialGuard_CAPA_Dossier_{today_str}.doc"
        return Response(content=doc_html, media_type="application/msword", headers={"Content-Disposition": f"attachment; filename={filename}"})

    else:
        dossier_data = {
            "trialId": PROTOCOL_CONFIG.trialId,
            "trialName": PROTOCOL_CONFIG.trialName,
            "exportTimestamp": datetime.now(timezone.utc).isoformat(),
            "exportedBy": user_ctx["user_name"],
            "userRole": user_ctx["role"],
            "totalCapas": len(capas),
            "capas": [c.model_dump(mode="json") for c in capas]
        }
        content = json.dumps(dossier_data, indent=2)
        filename = f"TrialGuard_CAPA_Dossier_{today_str}.json"
        return Response(content=content, media_type="application/json", headers={"Content-Disposition": f"attachment; filename={filename}"})

@router.get("/{capa_id}/export")
def export_single_capa(
    capa_id: str,
    request: Request,
    format: str = Query("json", description="Export format: json, csv, or doc"),
):
    """Exports an individual CAPA regulatory dossier in JSON, CSV, or formatted Word (.doc)."""
    ensure_capas()
    user_ctx = get_current_user_context(request)
    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA proposal with ID '{capa_id}' not found."
        )
    check_site_access(user_ctx, capa.siteId)
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    store.record_audit(
        action="CAPA_FORM_EXPORTED",
        performed_by=user_ctx["user_name"],
        role=user_ctx["role"],
        site_id=capa.siteId,
        target_id=capa.id,
        details={"format": format, "status": capa.status, "priority": capa.priority}
    )

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Field", "Value"])
        writer.writerow(["CAPA ID", capa.id])
        writer.writerow(["Status", capa.status])
        writer.writerow(["Priority", capa.priority])
        writer.writerow(["Site ID", capa.siteId])
        writer.writerow(["Site Name", capa.siteName or ""])
        writer.writerow(["Patient ID", capa.patientId or ""])
        writer.writerow(["Affected Participants", ", ".join(capa.affectedPatients or [])])
        writer.writerow(["Category", capa.category or ""])
        writer.writerow(["Title", capa.title or ""])
        writer.writerow(["Problem Statement", capa.problemStatement or ""])
        writer.writerow(["Evidence", capa.evidence or ""])
        writer.writerow(["Root Cause Hypothesis", capa.rootCauseHypothesis or ""])
        writer.writerow(["Corrective Action", capa.correctiveAction or ""])
        writer.writerow(["Preventive Action", capa.preventiveAction or ""])
        writer.writerow(["Owner", capa.suggestedOwner or capa.owner or ""])
        writer.writerow(["Due Date", capa.dueDate or ""])
        writer.writerow(["Created Date", capa.createdDate or ""])
        writer.writerow(["Last Updated", capa.lastUpdated or ""])
        writer.writerow(["Linked Deviations", ", ".join(capa.linkedDeviationIds or [])])
        comments_parts = []
        for cm in (capa.comments or []):
            author = getattr(cm, 'author', None) or (cm.get('author', 'User') if isinstance(cm, dict) else 'User')
            text = getattr(cm, 'text', None) or (cm.get('text', '') if isinstance(cm, dict) else str(cm))
            comments_parts.append(f"[{author}]: {text}")
        comments_str = "; ".join(comments_parts)
        writer.writerow(["Audit / History Comments", comments_str])
        content = output.getvalue()
        filename = f"TrialGuard_{capa.id}_Form_{today_str}.csv"
        return Response(content=content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})

    elif format.lower() == "doc":
        comments_items = []
        for cm in (capa.comments or []):
            author = getattr(cm, 'author', None) or (cm.get('author', 'User') if isinstance(cm, dict) else 'User')
            role_val = getattr(cm, 'role', None) or (cm.get('role', '') if isinstance(cm, dict) else '')
            date_val = getattr(cm, 'date', None) or (cm.get('date', '') if isinstance(cm, dict) else '')
            text_val = getattr(cm, 'text', None) or (cm.get('text', '') if isinstance(cm, dict) else str(cm))
            comments_items.append(f"<li style='margin-bottom:4px;'><strong>{author} ({role_val}, {date_val}):</strong> {text_val}</li>")
        comments_html = "".join(comments_items)
        doc_html = f"""<!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>CAPA Regulatory Form — {capa.id}</title>
        <style>
            body {{ font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #0f172a; margin: 24pt; }}
            h1 {{ color: #1e3a8a; font-size: 18pt; border-bottom: 2pt solid #2563eb; padding-bottom: 4pt; }}
            h2 {{ color: #1e40af; font-size: 13pt; margin-top: 14pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 2pt; }}
            .badge {{ display: inline-block; padding: 2pt 8pt; border-radius: 4pt; font-weight: bold; font-size: 10pt; }}
            .approved {{ background: #dcfce7; color: #166534; }}
            .rejected {{ background: #ffe4e6; color: #9f1239; }}
            .pending {{ background: #fef3c7; color: #92400e; }}
            table {{ border-collapse: collapse; width: 100%; margin: 10pt 0; }}
            th, td {{ border: 1px solid #cbd5e1; padding: 6pt 8pt; text-align: left; font-size: 10pt; }}
            th {{ background: #f8fafc; font-weight: bold; width: 28%; }}
            .notice {{ background: #f8fafc; border-left: 3pt solid #3b82f6; padding: 8pt; margin: 12pt 0; font-size: 10pt; color: #334155; }}
        </style>
        </head>
        <body>
            <h1>Corrective and Preventive Action (CAPA) Regulatory Record</h1>
            <p><strong>Protocol:</strong> CT-101 (Cardio-X Phase III) | <strong>Export Date:</strong> {today_str}</p>
            <div class="notice"><strong>21 CFR 312 & ICH GCP §5.20 Governance Record:</strong> This document constitutes formal GCP evidence of protocol non-compliance investigation and risk containment.</div>
            <table>
                <tr><th>CAPA Identifier</th><td><strong>{capa.id}</strong></td></tr>
                <tr><th>Current Status</th><td><span class="badge { 'approved' if capa.status == 'Approved' else 'rejected' if capa.status == 'Rejected' else 'pending' }">{capa.status}</span></td></tr>
                <tr><th>Priority Rating</th><td><strong>{capa.priority} Priority</strong></td></tr>
                <tr><th>Investigation Site</th><td>{capa.siteName} ({capa.siteId})</td></tr>
                <tr><th>Affected Subject(s)</th><td>{", ".join(capa.affectedPatients or []) if capa.affectedPatients else (capa.patientId or "Site-wide")}</td></tr>
                <tr><th>Category</th><td>{capa.category}</td></tr>
                <tr><th>Problem Statement</th><td>{capa.problemStatement}</td></tr>
                <tr><th>Objective Evidence</th><td>{capa.evidence}</td></tr>
                <tr><th>Root Cause Hypothesis (5-Whys)</th><td>{capa.rootCauseHypothesis}</td></tr>
                <tr><th>Immediate Corrective Action</th><td>{capa.correctiveAction}</td></tr>
                <tr><th>Systemic Preventive Action</th><td>{capa.preventiveAction}</td></tr>
                <tr><th>Assigned Operational Owner</th><td>{capa.suggestedOwner or capa.owner}</td></tr>
                <tr><th>Due Date</th><td>{capa.dueDate}</td></tr>
                <tr><th>Linked Protocol Deviations</th><td>{", ".join(capa.linkedDeviationIds or [])}</td></tr>
                { f"<tr><th>Rejection Reason</th><td style='color:#b91c1c;'><strong>{capa.rejectionReason}</strong></td></tr>" if capa.rejectionReason else "" }
            </table>
            <h2>Review Thread & Audit Trail</h2>
            <ul>{comments_html if comments_html else "<li>No reviewer comments recorded.</li>"}</ul>
        </body>
        </html>"""
        filename = f"TrialGuard_{capa.id}_Form_{today_str}.doc"
        return Response(content=doc_html, media_type="application/msword", headers={"Content-Disposition": f"attachment; filename={filename}"})

    else:
        content = json.dumps(capa.model_dump(mode="json"), indent=2)
        filename = f"TrialGuard_{capa.id}_Form_{today_str}.json"
        return Response(content=content, media_type="application/json", headers={"Content-Disposition": f"attachment; filename={filename}"})

@router.get("/{capa_id}", response_model=CAPA)
def get_capa(capa_id: str, request: Request) -> CAPA:
    ensure_capas()
    user_ctx = get_current_user_context(request)

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA proposal with ID '{capa_id}' not found."
        )

    check_site_access(user_ctx, capa.siteId)
    return capa

@router.post("", response_model=CAPA, status_code=status.HTTP_201_CREATED)
def create_capa(capa_in: CAPACreate, request: Request) -> CAPA:
    user_ctx = get_current_user_context(request)
    # Proposing a CAPA can be initiated by CRA, Data Manager, or Sponsor
    check_role_permission(user_ctx, ["CRA", "DATA_MANAGER", "SPONSOR"], "Create CAPA Proposal")

    return store.create_capa(
        capa_input=capa_in,
        user=user_ctx["user_name"],
        role=user_ctx["role"]
    )

@router.patch("/{capa_id}", response_model=CAPA)
def update_capa(capa_id: str, updates: CAPAUpdate, request: Request) -> CAPA:
    ensure_capas()
    user_ctx = get_current_user_context(request)

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA proposal with ID '{capa_id}' not found."
        )

    check_site_access(user_ctx, capa.siteId)

    # Status transition permissions:
    if updates.status:
        target_status = updates.status.strip().title()
        # Approval or Rejection is strictly reserved for Sponsor / Study Manager
        if target_status in ["Approved", "Rejected"]:
            check_role_permission(user_ctx, ["SPONSOR"], f"Set CAPA status to {target_status}")

        # Site Investigator cannot unilaterally mark CAPA Completed or Approved
        if user_ctx["role"] == "SITE_INVESTIGATOR" and target_status in ["Approved", "Completed"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Site Investigator cannot set CAPA status to '{target_status}'. Submit a site action plan instead."
            )

    # Operational field edits:
    # If Site Investigator, check they only update permitted fields on their own site's CAPA
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        if updates.priority or updates.owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Reassigning owner or changing CAPA priority is restricted to Lead CRA or Sponsor."
            )

    updated = store.update_capa(
        capa_id=capa_id,
        updates=updates,
        user=user_ctx["user_name"],
        role=user_ctx["role"],
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update CAPA."
        )

    return updated

@router.post("/{capa_id}/approve", response_model=CAPA)
def approve_capa(capa_id: str, request: Request, body: Optional[CAPAApproveRequest] = None) -> CAPA:
    """Formal CAPA approval. Strictly restricted to Sponsor / Study Manager role under 21 CFR 312."""
    ensure_capas()
    user_ctx = get_current_user_context(request)
    check_role_permission(user_ctx, ["SPONSOR"], "Approve CAPA Proposal")

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA with ID '{capa_id}' not found."
        )

    comment = body.comment if body else None
    approved = store.approve_capa(
        capa_id=capa_id,
        comment=comment,
        user=user_ctx["user_name"],
        role=user_ctx["role"]
    )
    if not approved:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve CAPA."
        )

    return approved

@router.post("/{capa_id}/reject", response_model=CAPA)
def reject_capa(capa_id: str, request: Request, body: CAPARejectRequest) -> CAPA:
    """Formal CAPA rejection with mandatory clinical reason. Strictly restricted to Sponsor."""
    ensure_capas()
    user_ctx = get_current_user_context(request)
    check_role_permission(user_ctx, ["SPONSOR"], "Reject CAPA Proposal")

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA with ID '{capa_id}' not found."
        )

    if not body.reason or not body.reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A substantive rejection reason is required for regulatory auditability."
        )

    rejected = store.reject_capa(
        capa_id=capa_id,
        reason=body.reason.strip(),
        comment=body.comment,
        user=user_ctx["user_name"],
        role=user_ctx["role"]
    )
    if not rejected:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject CAPA."
        )

    return rejected

@router.post("/{capa_id}/comments", response_model=CAPA)
def add_capa_comment(capa_id: str, request: Request, body: CAPACommentRequest) -> CAPA:
    """Adds a regulatory reviewer or investigator comment to a CAPA audit thread."""
    ensure_capas()
    user_ctx = get_current_user_context(request)

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA with ID '{capa_id}' not found."
        )

    check_site_access(user_ctx, capa.siteId)

    if not body.text or not body.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment text cannot be empty."
        )

    author = body.author or user_ctx["user_name"]
    role = body.role or user_ctx["role"]

    updated = store.add_capa_comment(
        capa_id=capa_id,
        text=body.text.strip(),
        user=author,
        role=role
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add comment to CAPA."
        )

    return updated
