import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  ShieldCheck, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  FileDown, 
  Send, 
  UserCheck, 
  Building2, 
  AlertTriangle,
  Lock,
  Sparkles,
  Edit3,
  XCircle,
  Save,
  Loader2,
  Info,
  Wand2
} from "lucide-react";
import { RiskBadge, SeverityBadge } from "./RiskBadge.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { PERMISSIONS } from "../auth/permissions.js";
import { useTrial } from "../context/TrialContext.jsx";
import { getCAPARecommendationWithAI } from "../api/trialApi.js";

export function CapaDetailDrawer({ capa, onClose, onUpdateStatus }) {
  if (!capa) return null;

  const { user, can, isInvestigator, isSponsor } = useAuth();
  const { approveCapa, rejectCapa, addCapaComment, editCapa } = useTrial();

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(capa.comments || capa.history || []);
  const [localStatus, setLocalStatus] = useState(capa.status);
  const [actionSuccess, setActionSuccess] = useState("");

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    rootCauseHypothesis: capa.rootCauseHypothesis || (Array.isArray(capa.rootCauses) ? capa.rootCauses.join("\n") : ""),
    correctiveAction: capa.correctiveAction || (Array.isArray(capa.actions) && capa.actions[0]?.step ? capa.actions[0].step : ""),
    preventiveAction: capa.preventiveAction || (Array.isArray(capa.actions) && capa.actions[1]?.step ? capa.actions[1].step : ""),
    suggestedOwner: capa.suggestedOwner || capa.owner || "Principal Investigator",
    priority: capa.priority || "High"
  });

  useEffect(() => {
    if (capa) {
      setLocalStatus(capa.status);
      setComments(capa.comments || capa.history || []);
      setFormData({
        rootCauseHypothesis: capa.rootCauseHypothesis || (Array.isArray(capa.rootCauses) ? capa.rootCauses.join("\n") : ""),
        correctiveAction: capa.correctiveAction || (Array.isArray(capa.actions) && capa.actions[0]?.step ? capa.actions[0].step : ""),
        preventiveAction: capa.preventiveAction || (Array.isArray(capa.actions) && capa.actions[1]?.step ? capa.actions[1].step : ""),
        suggestedOwner: capa.suggestedOwner || capa.owner || "Principal Investigator",
        priority: capa.priority || "High"
      });
      setIsEditing(false);
      setShowRejectModal(false);
      setRejectReason("");
      setAiRecommendation(null);
      setAiError(null);
      setAiLoading(false);
    }
  }, [capa]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiError, setAiError] = useState(null);

  const handleGenerateAIRecommendation = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await getCAPARecommendationWithAI({
        capaId: capa.id,
        siteId: capa.siteId,
        siteName: capa.siteName,
        category: capa.category || "Clinical Protocol Quality",
        problemStatement: capa.problemStatement,
        evidence: Array.isArray(capa.evidence) ? capa.evidence.join("; ") : (capa.evidence || ""),
        existingHypothesis: capa.rootCauseHypothesis || (Array.isArray(capa.rootCauses) ? capa.rootCauses.join("\n") : ""),
        linkedDeviations: capa.linkedDeviations || []
      });
      setAiRecommendation(res);
    } catch (err) {
      console.warn("AI CAPA recommendation error:", err);
      setAiError(err.message || "IBM Granite AI service is currently unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAIRecommendation = () => {
    if (!aiRecommendation) return;
    setIsEditing(true);
    setFormData((prev) => ({
      ...prev,
      rootCauseHypothesis: aiRecommendation.rootCauseHypothesis || prev.rootCauseHypothesis,
      correctiveAction: aiRecommendation.correctiveAction || prev.correctiveAction,
      preventiveAction: aiRecommendation.preventiveAction || prev.preventiveAction,
      suggestedOwner: aiRecommendation.suggestedOwner || prev.suggestedOwner,
    }));
  };

  const canApprove = can(PERMISSIONS.APPROVE_CAPA);
  const canRespond = can(PERMISSIONS.RESPOND_TO_CAPA);
  const canEdit = isSponsor || can(PERMISSIONS.VIEW_CAPA);

  const isApproved = localStatus === "Approved";
  const isRejected = localStatus === "Rejected";

  // Evidence list normalization
  const evidenceList = useMemo(() => {
    if (Array.isArray(capa.evidenceList) && capa.evidenceList.length > 0) return capa.evidenceList;
    if (Array.isArray(capa.evidence) && capa.evidence.length > 0) return capa.evidence;
    if (typeof capa.evidence === "string" && capa.evidence.trim()) return [capa.evidence];
    return [];
  }, [capa]);

  // Root causes list normalization
  const rootCausesList = useMemo(() => {
    if (Array.isArray(capa.rootCauses) && capa.rootCauses.length > 0) return capa.rootCauses;
    if (typeof capa.rootCauseHypothesis === "string" && capa.rootCauseHypothesis.trim()) {
      return [capa.rootCauseHypothesis];
    }
    return [];
  }, [capa]);

  // Actions normalization
  const actionsList = useMemo(() => {
    if (Array.isArray(capa.actions) && capa.actions.length > 0) return capa.actions;
    const derived = [];
    if (capa.correctiveAction) {
      derived.push({
        step: capa.correctiveAction,
        targetDays: 14,
        owner: capa.suggestedOwner || capa.owner || "Investigator",
        verification: "Standard operating procedure review and retraining verification"
      });
    }
    if (capa.preventiveAction) {
      derived.push({
        step: capa.preventiveAction,
        targetDays: 30,
        owner: capa.suggestedOwner || capa.owner || "Investigator",
        verification: "Automated electronic system verification & monitoring audit"
      });
    }
    return derived;
  }, [capa]);

  const handleApprove = async () => {
    if (!canApprove) return;
    setLocalStatus("Approved");
    try {
      if (approveCapa) {
        await approveCapa(capa.id, "CAPA formally approved and authorized under 21 CFR 312 GCP governance.", user);
      } else if (onUpdateStatus) {
        onUpdateStatus(capa.id, "Approved", user);
      }
      const approvalComment = {
        author: user?.name || "Elena Rostova",
        date: new Date().toISOString().slice(0, 10),
        role: user?.roleTitle || "Sponsor / Study Manager",
        text: "CAPA formally approved and authorized under 21 CFR 312 GCP governance. Implementation verified."
      };
      setComments((prev) => [...prev, approvalComment]);
      setActionSuccess("CAPA approved by Sponsor. Recorded in 21 CFR Part 11 audit trail.");
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to approve CAPA:", err);
    }
  };

  const handleReject = async () => {
    if (!canApprove) return;
    if (!rejectReason.trim()) return;
    setLocalStatus("Rejected");
    try {
      if (rejectCapa) {
        await rejectCapa(capa.id, rejectReason.trim(), "CAPA rejected by Sponsor reviewer.", user);
      } else if (onUpdateStatus) {
        onUpdateStatus(capa.id, "Rejected", user);
      }
      const rejectionComment = {
        author: user?.name || "Elena Rostova",
        date: new Date().toISOString().slice(0, 10),
        role: user?.roleTitle || "Sponsor / Study Manager",
        text: `CAPA REJECTED: ${rejectReason.trim()}`
      };
      setComments((prev) => [...prev, rejectionComment]);
      setShowRejectModal(false);
      setActionSuccess("CAPA rejected by Sponsor. Recorded in audit trail.");
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to reject CAPA:", err);
    }
  };

  const handleInvestigatorResponse = async () => {
    setLocalStatus("In Progress");
    try {
      if (editCapa) {
        await editCapa(capa.id, { status: "In Progress" }, user);
      } else if (onUpdateStatus) {
        onUpdateStatus(capa.id, "In Progress", user);
      }
      const invCommentText = `Site action plan submitted: Clinical coordinators retrained and electronic EHR alerts activated.`;
      if (addCapaComment) {
        await addCapaComment(capa.id, invCommentText, user);
      }
      const invComment = {
        author: user?.name || "Dr. Evelyn Zhao, MD",
        date: new Date().toISOString().slice(0, 10),
        role: user?.roleTitle || "Site Investigator",
        text: invCommentText
      };
      setComments((prev) => [...prev, invComment]);
      setActionSuccess("Site action plan submitted. Forwarded to Lead CRA and Sponsor for review.");
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to submit site response:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const text = newComment.trim();
    setNewComment("");

    try {
      if (addCapaComment) {
        await addCapaComment(capa.id, text, user);
      }
      const added = {
        author: user?.name || "Auditor",
        date: new Date().toISOString().slice(0, 10),
        role: user?.roleTitle || user?.role || "Reviewer",
        text
      };
      setComments((prev) => [...prev, added]);
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (editCapa) {
        await editCapa(capa.id, formData, user);
      }
      setIsEditing(false);
      setActionSuccess("CAPA operational parameters updated and audited.");
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to update CAPA:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-fade animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-900">
                {capa.id}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  localStatus === "Approved"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                    : localStatus === "Rejected"
                    ? "bg-rose-100 text-rose-800 border-rose-300 font-bold"
                    : localStatus === "In Progress"
                    ? "bg-blue-100 text-blue-800 border-blue-300 font-semibold"
                    : localStatus === "Completed"
                    ? "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
                    : "bg-amber-100 text-amber-800 border-amber-300 font-semibold"
                }`}
              >
                {localStatus}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  (isEditing ? formData.priority : capa.priority) === "Critical" || (isEditing ? formData.priority : capa.priority) === "High"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isEditing ? formData.priority : capa.priority} Priority
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {capa.siteName || capa.siteId}
              </span>
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-900 leading-snug">
              {capa.title || `CAPA for ${capa.siteId}: ${capa.category || "Clinical Protocol Quality"}`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !isApproved && !isRejected && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 rounded-md text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors text-xs flex items-center gap-1 font-medium"
                title="Edit CAPA details"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? "Cancel Edit" : "Edit"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-900 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}

        {/* Rejection Banner if rejected */}
        {isRejected && (
          <div className="px-6 py-3 bg-rose-50 border-b border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">CAPA Rejected by Sponsor</span>
              {capa.rejectionReason && (
                <p className="mt-0.5 text-rose-800 italic">"{capa.rejectionReason}"</p>
              )}
            </div>
          </div>
        )}

        {/* Human Review Required Header */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>Human Review Required Prior to Regulatory Submission</span>
          </div>
          <span className="text-[10px] font-mono bg-white text-amber-800 px-2 py-0.5 rounded border border-amber-300">
            21 CFR 312.60
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Assigned Owner / PI</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.suggestedOwner}
                  onChange={(e) => setFormData({ ...formData, suggestedOwner: e.target.value })}
                  className="mt-1 w-full px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                />
              ) : (
                <div className="mt-0.5 font-bold text-slate-900">{capa.suggestedOwner || capa.owner || "Principal Investigator"}</div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Priority Level</span>
              {isEditing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="mt-1 w-full px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <div className="mt-0.5 font-bold text-slate-900 font-mono">{capa.priority}</div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Linked Deviations</span>
              <div className="mt-0.5 font-bold text-blue-700 font-mono">
                {capa.linkedDeviationsCount || capa.linkedDeviationIds?.length || 0} deviation record{(capa.linkedDeviationsCount || capa.linkedDeviationIds?.length || 0) !== 1 ? "s" : ""}
              </div>
              {capa.linkedDeviationIds && capa.linkedDeviationIds.length > 0 && (
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  [{capa.linkedDeviationIds.join(", ")}]
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Affected Participants</span>
              <div className="mt-0.5 font-mono text-slate-800">
                {capa.affectedPatients?.join(", ") || capa.patientId || "Site-wide"}
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-slate-700" />
              Observed Problem Statement
            </h3>
            <p className="mt-2 text-slate-700 leading-relaxed font-medium">
              {capa.problemStatement}
            </p>
          </div>

          {/* Evidence */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-700" />
              Supporting Trial Evidence
            </h3>
            <div className="mt-2 space-y-1.5 text-slate-700">
              {evidenceList.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* IBM watsonx.ai Granite CAPA Recommendation Copilot           */}
          {/* ============================================================ */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-purple-50/20 to-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  IBM Granite CAPA Recommendations
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                ibm/granite-3-8b-instruct
              </span>
            </div>

            {!aiRecommendation && !aiLoading && !aiError && (
              <div className="p-3 bg-white rounded-lg border border-indigo-100 flex items-center justify-between gap-3 text-xs">
                <p className="text-slate-600">
                  Generate root-cause hypotheses, immediate corrective actions, and systemic preventive measures with IBM Granite.
                </p>
                <button
                  onClick={handleGenerateAIRecommendation}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI Recommendation</span>
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="p-4 bg-white rounded-lg border border-indigo-100 flex items-center justify-center gap-3 text-xs text-indigo-800">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="font-medium">Formulating GCP-aligned CAPA proposal with IBM Granite...</span>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>AI service offline. Standard CAPA candidate drafting remains active.</span>
                </div>
                <button
                  onClick={handleGenerateAIRecommendation}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {aiRecommendation && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-indigo-100 space-y-2.5">
                  <div>
                    <span className="font-semibold text-indigo-950">AI Root-Cause Hypothesis:</span>
                    <p className="text-slate-700 leading-relaxed mt-0.5">{aiRecommendation.rootCauseHypothesis}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-semibold text-emerald-800">Proposed Corrective Action:</span>
                    <p className="text-slate-700 leading-relaxed mt-0.5">{aiRecommendation.correctiveAction}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-semibold text-blue-800">Proposed Preventive Measure:</span>
                    <p className="text-slate-700 leading-relaxed mt-0.5">{aiRecommendation.preventiveAction}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700">Suggested Owner: </span>
                      <span className="font-medium text-slate-900">{aiRecommendation.suggestedOwner}</span>
                    </div>
                    {canEdit && !isApproved && !isRejected && (
                      <button
                        onClick={handleApplyAIRecommendation}
                        className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded transition-colors"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Apply to Action Plan</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-2 bg-indigo-50/50 rounded border border-indigo-100 text-[10px] text-indigo-900 leading-tight">
                  <span className="font-semibold">Notice:</span> {aiRecommendation.humanReviewNotice}
                </div>
              </div>
            )}
          </div>

          {/* Root Cause Analysis */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
              Root Cause Analysis (5-Whys Methodology)
            </h3>
            {isEditing ? (
              <textarea
                rows={3}
                value={formData.rootCauseHypothesis}
                onChange={(e) => setFormData({ ...formData, rootCauseHypothesis: e.target.value })}
                placeholder="Enter root cause analysis hypothesis..."
                className="mt-2 w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
              />
            ) : (
              <div className="mt-2 space-y-2 text-slate-700">
                {rootCausesList.map((rc, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-mono font-bold text-blue-700 text-xs">W{idx + 1}:</span>
                    <span className="leading-relaxed">{rc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Corrective Actions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Action Plan: Immediate Corrective Actions & Preventive Measures
            </h3>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Immediate Corrective Action</label>
                  <textarea
                    rows={2}
                    value={formData.correctiveAction}
                    onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Preventive Action (Systemic Fix)</label>
                  <textarea
                    rows={2}
                    value={formData.preventiveAction}
                    onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {actionsList.map((act, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{act.step}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Target: {act.targetDays || 14} days
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Owner: <strong className="text-slate-700">{act.owner || capa.suggestedOwner || "Investigator"}</strong></span>
                      <span className="italic">{act.verification || "Retraining verification & EHR audit"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviewer Comments & Audit History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Audit Trail & Reviewer Comments ({comments.length})
            </h3>

            <div className="space-y-2.5">
              {comments.map((c, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{c.author || c.user}</span>
                    <span className="text-slate-400 font-mono">{c.date || c.timestamp}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{c.role}</span>
                  <p className="mt-1.5 text-slate-700 leading-relaxed">{c.text || c.comment}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add compliance review note, investigator remark, or audit comment..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 flex items-center gap-1"
              >
                <span>Add</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => alert(`CAPA Form for ${capa.id} exported to PDF package according to ICH GCP guidelines.`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>Export CAPA Form</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Site Investigator Response Action */}
            {isInvestigator && localStatus !== "Approved" && localStatus !== "Rejected" && (
              <button
                onClick={handleInvestigatorResponse}
                className="px-3.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Site Action Plan</span>
              </button>
            )}

            {/* Sponsor Final Approval or Rejection */}
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-100 font-bold px-3.5 py-2 rounded-lg text-xs border border-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                Approved by Sponsor
              </span>
            ) : isRejected ? (
              <span className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-100 font-bold px-3.5 py-2 rounded-lg text-xs border border-rose-300">
                <XCircle className="w-4 h-4" />
                Rejected
              </span>
            ) : canApprove ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-3 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve CAPA</span>
                </button>
              </div>
            ) : (
              <div 
                className="relative group inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200/80 text-slate-500 font-medium cursor-not-allowed text-xs border border-slate-300"
                title="Requires Sponsor / Study Manager authorization (Elena Rostova)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Approve CAPA (Sponsor Only)</span>
              </div>
            )}
          </div>
        </div>

        {/* Sponsor Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <XCircle className="w-5 h-5" />
                  <span>Reject CAPA ({capa.id})</span>
                </div>
                <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                In accordance with 21 CFR Part 11 and GCP regulatory compliance, rejecting a CAPA candidate requires documenting the clinical or regulatory rationale.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection *</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Inadequate root cause investigation; retraining alone is insufficient without EHR alerting."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
