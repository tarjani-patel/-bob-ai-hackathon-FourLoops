import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function MetricCard({ 
  title, 
  value, 
  subtext, 
  subtitle, 
  trend, 
  trendDirection, 
  icon: Icon, 
  badge, 
  alertLevel, 
  onClick 
}) {
  const displaySubtext = subtext || subtitle;

  let borderColor = "border-blue-100/80 hover:border-blue-300/80";
  let iconBg = "bg-blue-50 text-blue-600 border border-blue-100";
  let glowColor = "hover:shadow-float";

  if (alertLevel === "danger" || trendDirection === "down") {
    borderColor = "border-rose-100 hover:border-rose-300";
    iconBg = "bg-rose-50 text-rose-600 border border-rose-100";
    glowColor = "hover:shadow-lg hover:shadow-rose-500/10";
  } else if (alertLevel === "warning") {
    borderColor = "border-amber-100 hover:border-amber-300";
    iconBg = "bg-amber-50 text-amber-600 border border-amber-100";
    glowColor = "hover:shadow-lg hover:shadow-amber-500/10";
  } else if (alertLevel === "success" || trendDirection === "up") {
    borderColor = "border-emerald-100 hover:border-emerald-300";
    iconBg = "bg-emerald-50 text-emerald-600 border border-emerald-100";
    glowColor = "hover:shadow-lg hover:shadow-emerald-500/10";
  }

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl border ${borderColor} p-5 shadow-glass transition-all duration-300 ${glowColor} ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              {value}
            </span>
            {badge && <div>{badge}</div>}
          </div>

          {displaySubtext && (
            <p className="mt-1 text-xs text-slate-500 font-medium truncate">
              {displaySubtext}
            </p>
          )}

          {trend && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
              {trendDirection === "up" ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="w-3 h-3" />
                  <span>{trend}</span>
                </span>
              ) : trendDirection === "down" ? (
                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <TrendingDown className="w-3 h-3" />
                  <span>{trend}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  <Minus className="w-3 h-3 text-slate-400" />
                  <span>{trend}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
