import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { getDoctorDashboard } from "@/services/dashboardService";
import { getDiagnosisAlerts, DiagnosisHistoryItem } from "@/services/diagnosisService";
import { getPatientsByDoctor, Patient } from "@/services/patientService";
import { useAuth } from "@/context/AuthContext";
import { Users, AlertTriangle, ClipboardList, FileText, Bell, Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = {
  primary: "hsl(217, 91%, 60%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  danger: "hsl(0, 84%, 60%)",
  muted: "hsl(215, 20%, 65%)",
  purple: "hsl(262, 83%, 58%)",
  teal: "hsl(174, 72%, 46%)",
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [alertsList, setAlertsList] = useState<DiagnosisHistoryItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises: Promise<any>[] = [getDoctorDashboard()];
    if (user?.userId) promises.push(getPatientsByDoctor(user.userId));
    promises.push(getDiagnosisAlerts());

    Promise.allSettled(promises).then(results => {
      if (results[0].status === "fulfilled") {
        setData(results[0].value.data?.data ?? results[0].value.data);
      }
      if (results[1]?.status === "fulfilled") {
        setPatients(Array.isArray(results[1].value.data?.data) ? results[1].value.data.data : []);
      }
      if (results[2]?.status === "fulfilled") {
        setAlertsList(Array.isArray(results[2].value.data?.data) ? results[2].value.data.data : []);
      }
      setLoading(false);
    });
  }, [user]);

  const cards = [
    { title: "Active Patients", value: data?.totalActivePatients ?? "—", icon: Users, variant: "primary" as const },
    { title: "Critical Alerts", value: data?.totalCriticalAlerts ?? "—", icon: AlertTriangle, variant: "danger" as const },
    { title: "High Risk", value: data?.highRiskCount ?? "—", icon: ClipboardList, variant: "warning" as const },
    { title: "Critical Count", value: data?.criticalCount ?? "—", icon: FileText, variant: "success" as const },
  ];

  // --- Chart Data ---

  // 1. Risk Distribution (Donut)
  const riskData = [
    { name: "Critical", value: data?.criticalCount ?? 0, color: COLORS.danger },
    { name: "High Risk", value: data?.highRiskCount ?? 0, color: COLORS.warning },
    { name: "Healthy", value: Math.max(0, (data?.totalActivePatients ?? 0) - (data?.criticalCount ?? 0) - (data?.highRiskCount ?? 0)), color: COLORS.success },
  ].filter(d => d.value > 0);

  // 2. Blood group distribution
  const bloodCounts = patients.reduce((acc, p) => {
    const bg = p.bloodGroup || "Unknown";
    acc[bg] = (acc[bg] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bloodGroupData = Object.entries(bloodCounts).map(([bg, count]) => ({ bloodGroup: bg, patients: count }));

  // Dashboard alert items
  const dashAlerts = Array.isArray(data?.criticalAlerts) ? data.criticalAlerts : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold">{payload[0].name || payload[0].payload?.name || payload[0].payload?.bloodGroup}</p>
        <p className="text-muted-foreground">{payload[0].value} patients</p>
      </div>
    );
  };

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((c, i) => <StatCard key={c.title} {...c} index={i} />)}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Distribution Donut */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card rounded-xl border border-border shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-warning flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-display font-semibold">Patient Risk Distribution</h3>
            </div>
            {riskData.length > 0 ? (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3 pl-4">
                  {riskData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                        <span className="text-sm">{d.name}</span>
                      </div>
                      <span className="text-sm font-display font-bold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">No patient data available</p>
            )}
          </motion.div>

          {/* Blood Group Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-danger flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-display font-semibold">Blood Group Distribution</h3>
            </div>
            {bloodGroupData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bloodGroupData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 25%)" opacity={0.3} />
                  <XAxis dataKey="bloodGroup" tick={{ fontSize: 12, fill: "hsl(215, 20%, 65%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(215, 20%, 65%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="patients" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {bloodGroupData.map((_, i) => (
                      <Cell key={i} fill={[COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.teal, COLORS.muted, COLORS.primary][i % 8]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">No patient data available</p>
            )}
          </motion.div>
        </div>

        {/* Critical Alerts List */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card rounded-xl border border-border shadow-card">
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-danger flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Recent Critical Alerts</h3>
            </div>
            {alertsList.length > 0 && (
              <Badge className="gradient-danger text-white border-0">{alertsList.length} active</Badge>
            )}
          </div>
          <div className="divide-y divide-border">
            {alertsList.length === 0 && dashAlerts.length === 0 && (
              <p className="px-6 py-8 text-center text-muted-foreground text-sm">No critical alerts</p>
            )}
            {(alertsList.length > 0 ? alertsList.slice(0, 5) : dashAlerts).map((alert: any, i: number) => {
              const conditions = alert.suspectedConditions ? alert.suspectedConditions.split(" | ") : [];
              return (
                <motion.div key={alert.id ?? i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-critical mt-0.5 shrink-0 animate-pulse-soft" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{alert.patientName}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{conditions[0] || alert.message || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={`text-xs ${alert.riskLevel === "CRITICAL" ? "text-critical border-critical/20" : "text-warning border-warning/20"}`}>
                      {alert.riskLevel || alert.severity || "CRITICAL"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {alert.analyzedAt ? new Date(alert.analyzedAt).toLocaleString() : alert.time || ""}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
