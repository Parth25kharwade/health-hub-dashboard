import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getDiagnosisAlerts } from "@/services/diagnosisService";
import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiagnosisAlerts()
      .then(r => setAlerts(Array.isArray(r.data?.data) ? r.data.data : r.data?.data ?? []))
      .catch(() => setAlerts([
        { id: 1, patientName: "Alice Johnson", message: "Critical blood pressure: 180/110 mmHg", severity: "CRITICAL", time: "10 min ago", patientId: "P-001" },
        { id: 2, patientName: "Bob Smith", message: "O₂ saturation dropped to 89%", severity: "CRITICAL", time: "25 min ago", patientId: "P-002" },
        { id: 3, patientName: "Carol White", message: "Blood sugar at 280 mg/dL", severity: "HIGH", time: "1 hr ago", patientId: "P-003" },
        { id: 4, patientName: "David Brown", message: "Hemoglobin below normal range", severity: "MEDIUM", time: "3 hrs ago", patientId: "P-004" },
        { id: 5, patientName: "Eve Davis", message: "Heart rate variability detected", severity: "MEDIUM", time: "5 hrs ago", patientId: "P-005" },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const sevConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: { bg: "bg-critical/8", text: "text-critical", border: "border-critical/25", dot: "gradient-danger" },
    HIGH: { bg: "bg-warning/8", text: "text-warning", border: "border-warning/25", dot: "gradient-warning" },
    MEDIUM: { bg: "bg-primary/5", text: "text-primary", border: "border-primary/20", dot: "gradient-primary" },
    LOW: { bg: "bg-success/5", text: "text-success", border: "border-success/20", dot: "gradient-success" },
  };

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;

  return (
    <DashboardLayout title="Alerts">
      <div className="max-w-2xl space-y-5 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-danger flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Active Alerts</h2>
              <p className="text-sm text-muted-foreground">{alerts.length} total — {criticalCount} critical</p>
            </div>
          </div>
          {criticalCount > 0 && (
            <Badge className="gradient-danger text-white border-0 animate-pulse-soft">{criticalCount} Critical</Badge>
          )}
        </div>

        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const cfg = sevConfig[alert.severity] ?? sevConfig.MEDIUM;
            return (
              <motion.div key={alert.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className={`flex items-start gap-4 p-4 rounded-xl border shadow-card ${cfg.bg} ${cfg.border}`}>
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${cfg.dot} ${alert.severity === "CRITICAL" ? "animate-pulse-soft" : ""}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{alert.patientName}</span>
                    {alert.patientId && <span className="text-xs text-muted-foreground">#{alert.patientId}</span>}
                  </div>
                  <p className="text-sm text-foreground/80">{alert.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant="outline" className={`text-xs ${cfg.text} ${cfg.border}`}>{alert.severity}</Badge>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              </motion.div>
            );
          })}
          {alerts.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mb-3" />
              <p className="font-display font-semibold text-lg">All Clear</p>
              <p className="text-muted-foreground text-sm">No active alerts at this time</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
