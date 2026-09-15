import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  Send, 
  FileDown, 
  Clock,
  Building2,
  AlertOctagon,
  FileCheck
} from "lucide-react";

export function CapaDetailDrawer({ capa, onClose, onUpdateStatus }) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(capa?.comments || []);
  const [currentStatus, setCurrentStatus] = useState(capa?.status || "Review Pending");
  const [isApproved, setIsApproved] = useState(capa?.status === "Approved");

  if (!capa) return null;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newEntry = {
      author: "Dr. Alex Mercer (Lead CRA)",
      role: "Compliance Auditor",
      date: new Date().toISOString().split("T")[0],
      text: newComment.trim()
    };
    setComments([...comments, newEntry]);
    setNewComment("");
  };

  const handleApprove = () => {
    setCurrentStatus("Approved");
    setIsApproved(true);
    if (onUpdateStatus) onUpdateStatus(capa.id, "Approved");
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-fade animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded">
                {capa.id}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                capa.priority === "Critical" 
                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}>
                {capa.priority} Priority
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                isApproved 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}>
                Status: {currentStatus}
              </span>
            </div>

            <h2 className="mt-2 text-base font-bold text-slate-900 leading-snug">
              {capa.title}
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Assigned Site: <span className="font-semibold text-slate-800">{capa.siteName}</span> • Due Date: <span className="font-mono font-medium text-slate-700">{capa.dueDate}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* PROMINENT MANDATORY BADGE: HUMAN REVIEW REQUIRED         */}
        {/* ======================================================== */}
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
              <FileCheck className="w-4 h-4 text-slate-700" />
              Objective Evidence (Audit Trail Data)
            </h3>
            <p className="mt-2 text-slate-700 leading-relaxed font-mono text-[11px] bg-white p-2.5 rounded border border-slate-200">
              {capa.evidence}
            </p>
          </div>

          {/* Root-Cause Hypothesis */}
          <div className="p-4 rounded-lg bg-blue-50/40 border border-blue-200 text-xs">
            <h3 className="font-bold text-blue-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              Root-Cause Hypothesis
            </h3>
            <p className="mt-2 text-slate-800 leading-relaxed">
              {capa.rootCauseHypothesis}
            </p>
          </div>

          {/* Corrective Action (Immediate) */}
          <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200 text-xs">
            <h3 className="font-bold text-amber-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Corrective Action (Immediate Containment)
            </h3>
            <div className="mt-2 text-slate-800 leading-relaxed whitespace-pre-line">
              {capa.correctiveAction}
            </div>
          </div>

          {/* Preventive Action (Systemic) */}
          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs">
            <h3 className="font-bold text-emerald-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Preventive Action (Systemic Process Improvement)
            </h3>
            <div className="mt-2 text-slate-800 leading-relaxed whitespace-pre-line">
              {capa.preventiveAction}
            </div>
          </div>

          {/* Audit Comments & History */}
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
            {!isApproved ? (
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve CAPA</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-100 font-bold px-3 py-2 rounded-lg text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Approved by Lead CRA
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
