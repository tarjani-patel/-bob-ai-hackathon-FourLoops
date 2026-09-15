import React, { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { RiskBadge, SeverityBadge } from "./RiskBadge.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { PERMISSIONS } from "../auth/permissions.js";

export function CapaDetailDrawer({ capa, onClose, onUpdateStatus }) {
  if (!capa) return null;

  const { user, can, isInvestigator, isSponsor } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(capa.history || []);
  const [localStatus, setLocalStatus] = useState(capa.status);
  const [actionSuccess, setActionSuccess] = useState("");

  const canApprove = can(PERMISSIONS.APPROVE_CAPA);
  const canRespond = can(PERMISSIONS.RESPOND_TO_CAPA);

  const isApproved = localStatus === "Approved";

  const handleApprove = () => {
    if (!canApprove) return;
    setLocalStatus("Approved");
    if (onUpdateStatus) {
      onUpdateStatus(capa.id, "Approved", user);
    }
    const approvalComment = {
      author: user?.name || "Elena Rostova",
      date: new Date().toLocaleDateString(),
      role: user?.roleTitle || "Sponsor / Study Manager",
      text: "CAPA formally approved and authorized under 21 CFR 312 GCP governance. Implementation verified."
    };
    setComments((prev) => [...prev, approvalComment]);
    setActionSuccess("CAPA approved by Sponsor. Recorded in 21 CFR Part 11 audit trail.");
    setTimeout(() => setActionSuccess(""), 4000);
  };

  const handleInvestigatorResponse = () => {
    setLocalStatus("In Progress");
    if (onUpdateStatus) {
      onUpdateStatus(capa.id, "In Progress", user);
    }
    const invComment = {
      author: user?.name || "Dr. Evelyn Zhao, MD",
      date: new Date().toLocaleDateString(),
      role: user?.roleTitle || "Site Investigator (Site 03)",
      text: "Site 03 corrective action plan submitted: Clinical coordinators retrained on visit scheduling window ±3 days. Electronic EHR alerts activated."
    };
    setComments((prev) => [...prev, invComment]);
    setActionSuccess("Site action plan submitted. Forwarded to Lead CRA and Sponsor for review.");
    setTimeout(() => setActionSuccess(""), 4000);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = {
      author: user?.name || "Auditor",
      date: new Date().toLocaleDateString(),
      role: user?.roleTitle || "Reviewer",
      text: newComment.trim()
    };

    setComments((prev) => [...prev, added]);
    setNewComment("");
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
                    : localStatus === "In Progress"
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {localStatus}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  capa.priority === "High"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {capa.priority} Priority
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {capa.siteName}
              </span>
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-900 leading-snug">
              {capa.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-900 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}

        {/* Human Review Required Header */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
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
              <div className="mt-0.5 font-bold text-slate-900">{capa.owner}</div>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Linked Deviations</span>
              <div className="mt-0.5 font-bold text-blue-700 font-mono">
                {capa.linkedDeviationsCount} deviation record{capa.linkedDeviationsCount > 1 ? "s" : ""}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">Affected Participants</span>
              <div className="mt-0.5 font-mono text-slate-800">
                {capa.affectedPatients?.join(", ") || "Multiple"}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">CAPA Category</span>
              <div className="mt-0.5 font-medium text-slate-800">{capa.category}</div>
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
            <div className="mt-2 space-y-1 text-slate-700">
              {capa.evidence?.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Root Cause Analysis */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
              Root Cause Analysis (5-Whys Methodology)
            </h3>
            <div className="mt-2 space-y-2 text-slate-700">
              {capa.rootCauses?.map((rc, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-700 text-xs">W{idx + 1}:</span>
                  <span>{rc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Corrective Actions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Action Plan: Immediate Corrective Actions
            </h3>
            <div className="space-y-2">
              {capa.actions?.map((act, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{act.step}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Target: {act.targetDays} days
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Owner: <strong className="text-slate-700">{act.owner}</strong></span>
                    <span className="italic">{act.verification}</span>
                  </div>
                </div>
              ))}
            </div>
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
                    <span className="font-bold text-slate-800">{c.author}</span>
                    <span className="text-slate-400 font-mono">{c.date}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{c.role}</span>
                  <p className="mt-1.5 text-slate-700 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add compliance review note or investigator remark..."
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
            {isInvestigator && localStatus !== "Approved" && (
              <button
                onClick={handleInvestigatorResponse}
                className="px-3.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Site Action Plan</span>
              </button>
            )}

            {/* Sponsor Final Approval or Permission-Gated Lock */}
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-100 font-bold px-3.5 py-2 rounded-lg text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Approved by Sponsor
              </span>
            ) : canApprove ? (
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve CAPA</span>
              </button>
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
      </div>
    </div>
  );
}
