import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { getAdminDashboard } from "@/services/dashboardService";
import { useAuth } from "@/context/AuthContext";
import { useResource, SHORT_DEPT } from "@/context/ResourceContext";
import { BedDouble, Users, Cpu, TrendingUp, RefreshCw } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Static baseline chart history — 'Now' point will be replaced by live API data
const ICU_HISTORY_BASE = [
  { time: "00:00", occupied: 18, total: 24 },
  { time: "04:00", occupied: 20, total: 24 },
  { time: "08:00", occupied: 22, total: 24 },
  { time: "12:00", occupied: 21, total: 24 },
  { time: "16:00", occupied: 23, total: 24 },
  { time: "20:00", occupied: 19, total: 24 },
];

// Fallback chart data when API has no records yet
const fallbackStaffData = [
  { dept: "Cardio", total: 12, onDuty: 8, workloadPct: 67 },
  { dept: "Neuro",  total: 10, onDuty: 6, workloadPct: 60 },
  { dept: "Ortho",  total: 8,  onDuty: 5, workloadPct: 63 },
  { dept: "Peds",   total: 14, onDuty: 10, workloadPct: 71 },
  { dept: "ICU",    total: 9,  onDuty: 9, workloadPct: 100 },
];

// All departments — used as seed rows so the table always shows every dept
const ALL_DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "ICU",
  "Emergency",
  "Radiology",
];

interface TableRow {
  department: string;
  totalStaff: number | null;
  onDutyStaff: number | null;
  workloadPct: number | null;
  stressLevel: string | null;
  live: boolean; // true = populated from API
}

/** Pick bar fill colour based on workload % */
const barColour = (pct: number) =>
  pct >= 90 ? "hsl(0 84% 60%)" : pct >= 70 ? "hsl(38 92% 50%)" : "hsl(var(--primary))";

/** Stress level badge config */
const stressBadge: Record<string, { label: string; cls: string }> = {
  LOW:      { label: "Low",      cls: "bg-success/10 text-success border-success/20" },
  MODERATE: { label: "Moderate", cls: "bg-warning/10 text-warning border-warning/20" },
  HIGH:     { label: "High",     cls: "bg-warning/10 text-warning border-warning/20" },
  CRITICAL: { label: "Critical", cls: "bg-critical/10 text-critical border-critical/20" },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { staffList, staffLoading, refreshStaff, icuData, icuLoading, refreshIcu, lastUpdated } = useResource();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  // Fetch admin dashboard summary
  useEffect(() => {
    const hid = user?.hospitalId ?? "H001";
    getAdminDashboard(hid)
      .then(r => setData(r.data?.data ?? r.data))
      .catch(() => setData({ icuBeds: 24, staffWorkload: 78, equipmentUsage: 65, resourceStress: "HIGH" }));
  }, [user]);

  // Re-fetch dashboard summary when staff is refreshed (catches updated workload %)
  useEffect(() => {
    if (!lastUpdated) return;
    const hid = user?.hospitalId ?? "H001";
    getAdminDashboard(hid)
      .then(r => setData(r.data?.data ?? r.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdated]);

  // Convert live staff list → chart-friendly shape
  const staffChartData =
    staffList.length > 0
      ? staffList.map(s => ({
          dept: SHORT_DEPT[s.department] ?? s.department,
          total: s.totalStaff,
          onDuty: s.onDutyStaff,
          workloadPct: s.workloadPct,
        }))
      : fallbackStaffData;

  // Build a merged table — all 7 departments always shown, live data overlaid where available
  const liveMap = new Map(staffList.map(s => [s.department, s]));
  const mergedTableData: TableRow[] = ALL_DEPARTMENTS.map(dept => {
    const live = liveMap.get(dept);
    return live
      ? { department: dept, totalStaff: live.totalStaff, onDutyStaff: live.onDutyStaff, workloadPct: live.workloadPct, stressLevel: live.stressLevel, live: true }
      : { department: dept, totalStaff: null, onDutyStaff: null, workloadPct: null, stressLevel: null, live: false };
  });

  // ICU chart data — static history baseline with live 'Now' point from API
  const icuChartData = [
    ...ICU_HISTORY_BASE,
    {
      time: "Now",
      occupied: icuData?.occupiedBeds ?? 20,
      total:    icuData?.totalBeds    ?? 24,
    },
  ];
  const icuStatValue = icuData
    ? `${icuData.occupiedBeds}/${icuData.totalBeds}`
    : `${ICU_HISTORY_BASE[5].occupied}/${ICU_HISTORY_BASE[0].total}`;

  // Average workload across all departments for the stat card
  const avgWorkload =
    staffList.length > 0
      ? Math.round(staffList.reduce((acc, s) => acc + s.workloadPct, 0) / staffList.length)
      : (data?.staffWorkload as number) ?? 78;

  const cards = [
    { title: "ICU Beds (Occupied)", value: icuStatValue, icon: BedDouble, variant: (icuData?.utilizationPct ?? 0) >= 90 ? "danger" as const : "warning" as const },
    { title: "Staff Workload",      value: `${avgWorkload}%`,                              icon: Users,      variant: avgWorkload >= 90 ? "danger" as const : "warning" as const },
    { title: "Equipment Usage",     value: `${(data?.equipmentUsage as number) ?? 65}%`,   icon: Cpu,        variant: "primary" as const },
    { title: "Resource Stress",     value: (icuData?.stressLevel ?? (data?.resourceStress as string)) ?? "HIGH", icon: TrendingUp, variant: "danger" as const },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((c, i) => <StatCard key={c.title} {...c} index={i} />)}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* ICU Chart — live from ResourceContext */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold">ICU Bed Usage</h3>
              <button
                onClick={refreshIcu}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <AnimatePresence>
                  {icuLoading && (
                    <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    </motion.span>
                  )}
                </AnimatePresence>
                {!icuLoading && <RefreshCw className="w-3.5 h-3.5" />}
                Refresh
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {icuData
                ? `${icuData.occupiedBeds} occupied · ${icuData.availableBeds} available · ${icuData.utilizationPct.toFixed(1)}% utilization`
                : "Occupied vs total capacity"}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={icuChartData}>
                <defs>
                  <linearGradient id="icuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(0 84% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="total"    stroke="hsl(var(--border))" fill="transparent" strokeDasharray="5 5" name="Total" />
                <Area type="monotone" dataKey="occupied" stroke="hsl(0 84% 60%)" fill="url(#icuGrad)" strokeWidth={2} name="Occupied" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Staff Chart — live from ResourceContext */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold">Staff Workload by Department</h3>
              <button
                onClick={refreshStaff}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <AnimatePresence>
                  {staffLoading && (
                    <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    </motion.span>
                  )}
                </AnimatePresence>
                {!staffLoading && <RefreshCw className="w-3.5 h-3.5" />}
                Refresh
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">On-duty vs total staff · colour = workload severity</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={staffChartData} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value, name, props) => {
                    if (name === "On Duty") {
                      const pct = props.payload?.workloadPct;
                      return [`${value} (${pct != null ? pct.toFixed(1) : "—"}%)`, name];
                    }
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onDuty" name="On Duty" radius={[4, 4, 0, 0]}>
                  {staffChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColour(entry.workloadPct)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── Live Staff Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
        >
          {/* Table header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">Staff Overview</h3>
                <p className="text-xs text-muted-foreground">
                  {staffList.length > 0
                    ? `${staffList.length} of ${ALL_DEPARTMENTS.length} departments updated · live data`
                    : `${ALL_DEPARTMENTS.length} departments · no updates yet`}
                </p>
              </div>
            </div>
            <button
              onClick={refreshStaff}
              disabled={staffLoading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${staffLoading ? "animate-spin" : ""}`} />
              {staffLoading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Staff</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">On Duty</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workload</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stress Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence mode="popLayout">
                  {mergedTableData.map((s, i) => {
                    const isLive = s.live;
                    const pct = s.workloadPct ?? 0;
                    const badge = isLive
                      ? (stressBadge[s.stressLevel!] ?? stressBadge["LOW"])
                      : { label: "Not Updated", cls: "bg-muted text-muted-foreground border-border" };
                    const barFill = pct >= 90 ? "bg-critical" : pct >= 70 ? "bg-warning" : "bg-success";

                    return (
                      <motion.tr
                        key={s.department}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, delay: i * 0.04 }}
                        className={`transition-colors ${isLive ? "hover:bg-muted/40" : "hover:bg-muted/20 opacity-70"}`}
                      >
                        {/* # */}
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{i + 1}</td>

                        {/* Department */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{s.department}</span>
                            {isLive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" title="Live data" />
                            )}
                          </div>
                        </td>

                        {/* Total Staff */}
                        <td className="px-6 py-4 text-right tabular-nums">
                          {isLive ? s.totalStaff : <span className="text-muted-foreground">—</span>}
                        </td>

                        {/* On Duty */}
                        <td className="px-6 py-4 text-right tabular-nums font-semibold">
                          {isLive ? s.onDutyStaff : <span className="text-muted-foreground font-normal">—</span>}
                        </td>

                        {/* Workload % with mini progress bar */}
                        <td className="px-6 py-4 text-right">
                          {isLive ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${barFill}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(pct, 100)}%` }}
                                  transition={{ duration: 0.6, ease: "easeOut" }}
                                />
                              </div>
                              <span className={`tabular-nums font-semibold ${pct >= 90 ? "text-critical" : pct >= 70 ? "text-warning" : "text-success"}`}>
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Stress badge */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>

              {/* Footer totals row — only counts live rows */}
              {staffList.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/30 border-t border-border">
                    <td colSpan={2} className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Totals (updated depts.)
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums font-bold">
                      {staffList.reduce((a, s) => a + s.totalStaff, 0)}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums font-bold">
                      {staffList.reduce((a, s) => a + s.onDutyStaff, 0)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`tabular-nums font-bold ${avgWorkload >= 90 ? "text-critical" : avgWorkload >= 70 ? "text-warning" : "text-success"}`}>
                        {avgWorkload}%
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
