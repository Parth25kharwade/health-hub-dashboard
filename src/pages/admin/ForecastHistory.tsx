import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getForecastHistory } from "@/services/resourceService";
import { useAuth } from "@/context/AuthContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import {
  BarChart2, RefreshCw, AlertTriangle, Lightbulb,
  ShieldAlert, Activity, ChevronDown, ChevronUp, Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ForecastRecord {
  hospitalId: number;
  hospitalName: string;
  stressLevel: string;
  icuStressScore: number;
  staffStressScore: number;
  equipmentStressScore: number;
  overallStressScore: number;
  alerts: string[];
  recommendations: string[];
  forecastDate: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STRESS_BADGE: Record<string, { cls: string; label: string }> = {
  LOW:      { cls: "bg-success/10 text-success border-success/20",   label: "Low"      },
  MODERATE: { cls: "bg-warning/10 text-warning border-warning/20",   label: "Moderate" },
  HIGH:     { cls: "bg-warning/10 text-warning border-warning/20",   label: "High"     },
  CRITICAL: { cls: "bg-critical/10 text-critical border-critical/30", label: "Critical" },
};

const STRESS_TEXT: Record<string, string> = {
  LOW: "text-success", MODERATE: "text-warning", HIGH: "text-warning", CRITICAL: "text-critical",
};

const LINE_COLORS = {
  icu:       "hsl(0 84% 60%)",
  staff:     "hsl(199 89% 48%)",
  equipment: "hsl(280 70% 60%)",
  overall:   "hsl(38 92% 50%)",
};

/** Format "2026-03-14T11:01:43" → "Mar 14 11:01" */
const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
};

/** Format just the time for dense chart labels */
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[180px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-bold" style={{ color: p.color }}>{p.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const ForecastHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ForecastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const fetchHistory = () => {
    setLoading(true);
    const hid = user?.hospitalId ?? 1;
    getForecastHistory(hid)
      .then(r => {
        const raw = r.data?.data ?? r.data;
        setHistory(Array.isArray(raw) ? raw : raw ? [raw] : []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, [user]);

  // Chart data — newest first from API, reverse for chronological chart display
  const chartData = [...history].reverse().map(r => ({
    label:           fmtTime(r.forecastDate),
    fullDate:        fmt(r.forecastDate),
    "ICU Stress":         r.icuStressScore,
    "Staff Stress":       r.staffStressScore,
    "Equipment Stress":   r.equipmentStressScore,
    "Overall Score":      r.overallStressScore,
    stressLevel:     r.stressLevel,
  }));

  const latest = history[0];
  const hospitalName = latest?.hospitalName ?? "Hospital";

  return (
    <DashboardLayout title="Forecast History">
      <div className="space-y-5 animate-fade-in">

        {/* ── Summary Cards (latest forecast) ──────────────────────────────── */}
        {latest && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {[
              { label: "ICU Stress",       value: latest.icuStressScore,       color: LINE_COLORS.icu,       icon: "🏥" },
              { label: "Staff Stress",     value: latest.staffStressScore,     color: LINE_COLORS.staff,     icon: "👥" },
              { label: "Equipment Stress", value: latest.equipmentStressScore, color: LINE_COLORS.equipment, icon: "⚙️" },
              { label: "Overall Score",    value: latest.overallStressScore,   color: LINE_COLORS.overall,   icon: "📊" },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card rounded-xl border border-border shadow-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <span className="text-base">{card.icon}</span>
                </div>
                <p className="text-2xl font-display font-bold" style={{ color: card.color }}>
                  {card.value.toFixed(1)}%
                </p>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: card.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(card.value, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.07 + 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Trend Chart ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Stress Score Trends</h3>
                <p className="text-xs text-muted-foreground">
                  {hospitalName} · {history.length} forecast records
                </p>
              </div>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {history.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
              No forecast data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={90} stroke="hsl(0 84% 60%)" strokeDasharray="4 4" label={{ value: "Critical", fontSize: 10, fill: "hsl(0 84% 60%)" }} />
                <ReferenceLine y={70} stroke="hsl(38 92% 50%)" strokeDasharray="4 4" label={{ value: "High", fontSize: 10, fill: "hsl(38 92% 50%)" }} />
                <Line type="monotone" dataKey="ICU Stress"       stroke={LINE_COLORS.icu}       strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Staff Stress"     stroke={LINE_COLORS.staff}     strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Equipment Stress" stroke={LINE_COLORS.equipment} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Overall Score"    stroke={LINE_COLORS.overall}   strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* ── Forecast Records Table ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm">Forecast Records</h3>
              <p className="text-xs text-muted-foreground">
                Click a row to see alerts &amp; recommendations
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  {["#", "Date & Time", "Stress Level", "ICU Score", "Staff Score", "Equip Score", "Overall", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />Loading forecast history…
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground text-xs">
                      No forecast records found. Run a prediction to generate history.
                    </td>
                  </tr>
                ) : (
                  history.map((row, i) => {
                    const badge = STRESS_BADGE[row.stressLevel] ?? STRESS_BADGE["LOW"];
                    const textCls = STRESS_TEXT[row.stressLevel] ?? "text-foreground";
                    const isExpanded = expandedRow === i;

                    return (
                      <>
                        <motion.tr
                          key={`row-${i}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.5) }}
                          onClick={() => setExpandedRow(isExpanded ? null : i)}
                          className="hover:bg-muted/40 transition-colors cursor-pointer"
                        >
                          {/* # */}
                          <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{i + 1}</td>

                          {/* Date */}
                          <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" title="Latest" />}
                              {fmt(row.forecastDate)}
                            </div>
                          </td>

                          {/* Stress Level */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </td>

                          {/* ICU Score */}
                          <td className={`px-5 py-3.5 tabular-nums font-semibold ${row.icuStressScore >= 90 ? "text-critical" : row.icuStressScore >= 70 ? "text-warning" : "text-success"}`}>
                            {row.icuStressScore.toFixed(1)}%
                          </td>

                          {/* Staff Score */}
                          <td className={`px-5 py-3.5 tabular-nums font-semibold ${row.staffStressScore >= 90 ? "text-critical" : row.staffStressScore >= 70 ? "text-warning" : "text-success"}`}>
                            {row.staffStressScore.toFixed(1)}%
                          </td>

                          {/* Equipment Score */}
                          <td className={`px-5 py-3.5 tabular-nums font-semibold ${row.equipmentStressScore >= 90 ? "text-critical" : row.equipmentStressScore >= 70 ? "text-warning" : "text-success"}`}>
                            {row.equipmentStressScore.toFixed(1)}%
                          </td>

                          {/* Overall Score */}
                          <td className={`px-5 py-3.5 tabular-nums font-bold ${textCls}`}>
                            {row.overallStressScore.toFixed(2)}%
                          </td>

                          {/* Expand toggle */}
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4" />
                              : <ChevronDown className="w-4 h-4" />}
                          </td>
                        </motion.tr>

                        {/* ── Expanded: Alerts + Recommendations ── */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr key={`expanded-${i}`}>
                              <td colSpan={8} className="px-0 py-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-6 py-5 bg-muted/30 border-t border-border">
                                    {/* Hospital meta */}
                                    <div className="xl:col-span-2 flex items-center gap-2 text-xs text-muted-foreground pb-1">
                                      <Building2 className="w-3.5 h-3.5" />
                                      <span className="font-medium text-foreground">{row.hospitalName}</span>
                                      <span>·</span>
                                      <span>Hospital ID {row.hospitalId}</span>
                                      <span>·</span>
                                      <span>{fmt(row.forecastDate)}</span>
                                    </div>

                                    {/* Alerts */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-warning mb-2">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Alerts ({row.alerts.length})
                                      </div>
                                      {row.alerts.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No alerts for this forecast.</p>
                                      ) : (
                                        row.alerts.map((alert, ai) => (
                                          <div key={ai} className="flex items-start gap-2 text-xs bg-warning/5 border border-warning/20 rounded-lg px-3 py-2">
                                            <span className="text-sm leading-tight">{alert}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    {/* Recommendations */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                                        <Lightbulb className="w-3.5 h-3.5" />
                                        Recommendations ({row.recommendations.length})
                                      </div>
                                      {row.recommendations.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No recommendations for this forecast.</p>
                                      ) : (
                                        row.recommendations.map((rec, ri) => (
                                          <div key={ri} className="flex items-start gap-2 text-xs bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                                            <span className="text-primary font-bold mt-0.5">→</span>
                                            <span>{rec}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    {/* Score mini-bars */}
                                    <div className="xl:col-span-2 grid grid-cols-2 xl:grid-cols-4 gap-3 pt-1">
                                      {[
                                        { label: "ICU Stress",       value: row.icuStressScore,       color: LINE_COLORS.icu },
                                        { label: "Staff Stress",     value: row.staffStressScore,     color: LINE_COLORS.staff },
                                        { label: "Equipment Stress", value: row.equipmentStressScore, color: LINE_COLORS.equipment },
                                        { label: "Overall Score",    value: row.overallStressScore,   color: LINE_COLORS.overall },
                                      ].map(sc => (
                                        <div key={sc.label} className="bg-card rounded-lg px-3 py-2.5 border border-border">
                                          <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs text-muted-foreground">{sc.label}</span>
                                            <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.value.toFixed(1)}%</span>
                                          </div>
                                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                              className="h-full rounded-full transition-all duration-700"
                                              style={{ width: `${Math.min(sc.value, 100)}%`, background: sc.color }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {history.length > 0 && (
            <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>{history.length} records · latest: {latest ? fmt(latest.forecastDate) : "—"}</span>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3" />
                <span>Overall stress: <span className={`font-bold ${STRESS_TEXT[latest?.stressLevel ?? ""] ?? ""}`}>{latest?.stressLevel}</span></span>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default ForecastHistory;
