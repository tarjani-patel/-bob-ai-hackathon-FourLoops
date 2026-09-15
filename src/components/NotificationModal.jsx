import React, { useState } from "react";
import { X, Bell, CheckCircle2, AlertTriangle, ShieldAlert, Info, ExternalLink, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrial } from "../context/TrialContext.jsx";

export function NotificationModal({ isOpen, onClose }) {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useTrial();
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "All") return true;
    if (activeTab === "Critical") return notif.type === "Critical";
    if (activeTab === "Warnings") return notif.type === "Warnings";
    if (activeTab === "Info") return notif.type === "Info";
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case "Critical":
        return <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />;
      case "Warnings":
        return <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />;
    }
  };

  const handleAction = (notif) => {
    markNotificationRead(notif.id);
    if (notif.actionLink) {
      navigate(notif.actionLink);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-fade animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Centered Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Compliance & Safety Alerts</h3>
              <p className="text-xs text-slate-500">Live deterministic findings & protocol threshold notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters & Action Bar */}
        <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {["All", "Critical", "Warnings", "Info"].map((tab) => {
              const count = notifications.filter((n) => (tab === "All" ? true : n.type === tab)).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab} <span className="opacity-75 text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
              <p className="mt-2 text-sm font-semibold text-slate-700">No alerts in this category</p>
              <p className="text-xs text-slate-400">All protocol parameters within expected tolerances</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`pt-3 first:pt-0 flex items-start justify-between gap-4 p-3 rounded-lg transition-colors ${
                  !notif.read ? "bg-blue-50/40 border border-blue-100" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(notif.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                      <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    {notif.siteId && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          Site: {notif.siteId}
                        </span>
                        {notif.patientId && (
                          <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            Patient: {notif.patientId}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {notif.actionLink && (
                    <button
                      onClick={() => handleAction(notif)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => {
              navigate("/deviations");
              onClose();
            }}
            className="font-medium text-slate-700 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Deviations</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              navigate("/settings");
              onClose();
            }}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Notification Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
