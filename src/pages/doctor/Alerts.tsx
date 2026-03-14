import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getDiagnosisAlerts, DiagnosisHistoryItem } from "@/services/diagnosisService";
import { AlertTriangle, Bell, CheckCircle2, Loader2, Lightbulb, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const riskConfig: Record<string, { color: string; dot: string; bg: string; border: string; icon: any }> = {
  CRITICAL: { color: "text-critical", dot: "gradient-danger", bg: "bg-critical/8", border: "border-critical/25", icon: AlertTriangle },
  HIGH: { color: "text-critical", dot: "gradient-danger", bg: "bg-warning/8", border: "border-warning/25", icon: AlertTriangle },
  MEDIUM: { color: "text-warning", dot: "gradient-warning", bg: "bg-primary/5", border: "border-primary/20", icon: Info },
  LOW: { color: "text-success", dot: "gradient-success", bg: "bg-success/5", border: "border-success/20", icon: CheckCircle2 },
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<DiagnosisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    getDiagnosisAlerts()
      .then(r => setAlerts(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const criticalCount = alerts.filter(a => a.riskLevel === "CRITICAL").length;

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

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-success mb-3" />
            <p className="font-display font-semibold text-lg">All Clear</p>
            <p className="text-muted-foreground text-sm">No active alerts at this time</p>
          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert, i) => {
              const cfg = riskConfig[alert.riskLevel] ?? riskConfig.MEDIUM;
              const isExpanded = expandedId === alert.id;
              const conditions = alert.suspectedConditions ? alert.suspectedConditions.split(" | ") : [];
              const diagAlerts = alert.diagnosticAlerts ? alert.diagnosticAlerts.split(" | ") : [];
              const recs = alert.recommendations ? alert.recommendations.split(" | ") : [];

              return (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className={`rounded-xl border shadow-card overflow-hidden ${cfg.bg} ${cfg.border}`}>

                  {/* Header row — clickable */}
                  <button onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                    className="flex items-start gap-4 p-4 w-full text-left hover:bg-black/5 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${cfg.dot} ${alert.riskLevel === "CRITICAL" ? "animate-pulse-soft" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{alert.patientName}</span>
                        <span className="text-xs text-muted-foreground">#{alert.patientId}</span>
                      </div>
                      <p className="text-sm text-foreground/80 truncate">{conditions[0] || "—"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-display font-bold ${cfg.color}`}>{alert.riskScore}</span>
                        <Badge variant="outline" className={`text-xs ${cfg.color} ${cfg.border}`}>{alert.riskLevel}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{new Date(alert.analyzedAt).toLocaleString()}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid hsl(var(--border) / 0.5)" }}>
                          {/* Diagnostic Alerts */}
                          {diagAlerts.length > 0 && (
                            <div className="pt-3">
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Diagnostic Alerts</p>
                              <div className="space-y-1">
                                {diagAlerts.map((a, j) => (
                                  <div key={j} className="flex items-start gap-2 px-3 py-1.5 bg-critical/5 rounded-lg border border-critical/20 text-sm">
                                    <AlertTriangle className="w-3.5 h-3.5 text-critical mt-0.5 shrink-0" />{a}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Suspected Conditions */}
                          {conditions.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Suspected Conditions</p>
                              <div className="space-y-1">
                                {conditions.map((c, j) => (
                                  <div key={j} className="flex items-center gap-2 px-3 py-1.5 bg-warning/5 rounded-lg border border-warning/20 text-sm">{c}</div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {recs.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Recommendations</p>
                              <div className="space-y-1">
                                {recs.map((r, j) => (
                                  <div key={j} className="flex items-start gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                                    <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />{r}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
