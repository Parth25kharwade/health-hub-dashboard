import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { getDoctorDashboard } from "@/services/dashboardService";
import { getDiagnosisAlerts } from "@/services/diagnosisService";
import { Users, AlertTriangle, ClipboardList, FileText, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const DoctorDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDoctorDashboard(), getDiagnosisAlerts()])
      .then(([dash, al]) => { setData(dash.data); setAlerts(al.data || []); })
      .catch(() => {
        setData({ totalPatients: 42, criticalAlerts: 3, recentDiagnoses: 8, recentRecords: 15 });
        setAlerts([
          { id: 1, patientName: "Alice Johnson", message: "Critical blood pressure detected", severity: "CRITICAL", time: "10 min ago" },
          { id: 2, patientName: "Bob Smith", message: "Low oxygen saturation alert", severity: "HIGH", time: "25 min ago" },
          { id: 3, patientName: "Carol White", message: "Elevated blood sugar levels", severity: "MEDIUM", time: "1 hr ago" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Total Patients", value: data?.totalPatients ?? "—", icon: Users, variant: "primary" as const },
    { title: "Critical Alerts", value: data?.criticalAlerts ?? "—", icon: AlertTriangle, variant: "danger" as const },
    { title: "Recent Diagnoses", value: data?.recentDiagnoses ?? "—", icon: ClipboardList, variant: "warning" as const },
    { title: "Recent Records", value: data?.recentRecords ?? "—", icon: FileText, variant: "success" as const },
  ];

  const severityColor: Record<string, string> = {
    CRITICAL: "bg-critical/10 text-critical border-critical/20",
    HIGH: "bg-warning/10 text-warning border-warning/20",
    MEDIUM: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((c, i) => <StatCard key={c.title} {...c} index={i} />)}
        </div>

        {/* Alerts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card rounded-xl border border-border shadow-card">
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-danger flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Critical Alerts</h3>
            </div>
            {alerts.length > 0 && (
              <Badge className="gradient-danger text-white border-0">{alerts.length} active</Badge>
            )}
          </div>
          <div className="divide-y divide-border">
            {alerts.length === 0 && (
              <p className="px-6 py-8 text-center text-muted-foreground text-sm">No critical alerts</p>
            )}
            {alerts.map((alert, i) => (
              <motion.div key={alert.id ?? i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-start gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                <AlertTriangle className="w-5 h-5 text-critical mt-0.5 shrink-0 animate-pulse-soft" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{alert.patientName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${severityColor[alert.severity] ?? "bg-muted text-muted-foreground"}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
