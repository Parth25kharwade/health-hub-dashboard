import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { predictResourceStress } from "@/services/resourceService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2, AlertTriangle, CheckCircle2, Info, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const levelConfig: Record<string, { label: string; icon: any; cardClass: string; iconClass: string; barClass: string; width: string }> = {
  LOW: { label: "LOW", icon: CheckCircle2, cardClass: "bg-success/5 border-success/20", iconClass: "text-success", barClass: "gradient-success", width: "25%" },
  MEDIUM: { label: "MEDIUM", icon: Info, cardClass: "bg-warning/5 border-warning/20", iconClass: "text-warning", barClass: "gradient-warning", width: "50%" },
  HIGH: { label: "HIGH", icon: AlertTriangle, cardClass: "bg-critical/5 border-critical/20", iconClass: "text-critical", barClass: "gradient-danger", width: "75%" },
  CRITICAL: { label: "CRITICAL", icon: Zap, cardClass: "bg-critical/10 border-critical/30", iconClass: "text-critical", barClass: "gradient-danger", width: "100%" },
};

const ResourcePrediction = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePredict = async () => {
    setLoading(true);
    const hid = user?.hospitalId ?? "H001";
    try {
      const { data } = await predictResourceStress(hid);
      setResult(data);
    } catch {
      setResult({ stressLevel: "HIGH", message: "High patient influx expected in next 24h. ICU capacity may be exceeded.", recommendation: "Consider activating surge protocols and increasing staffing levels." });
    } finally { setLoading(false); }
  };

  const cfg = result ? (levelConfig[result.stressLevel] ?? levelConfig.MEDIUM) : null;

  return (
    <DashboardLayout title="Resource Stress Prediction">
      <div className="max-w-xl space-y-5 animate-fade-in">
        <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold">AI Stress Forecasting</h3>
              <p className="text-xs text-muted-foreground">Hospital: {user?.hospitalId ?? "H001"}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Run the AI model to predict upcoming resource stress levels based on historical patterns, current occupancy, and seasonal trends.
          </p>

          <Button onClick={handlePredict} disabled={loading} className="w-full gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Running prediction…</> : <><TrendingUp className="w-4 h-4 mr-2" /> Run Stress Prediction</>}
          </Button>
        </div>

        <AnimatePresence>
          {result && cfg && (
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`rounded-xl border shadow-card p-6 space-y-4 ${cfg.cardClass}`}>
              <div className="flex items-center gap-3">
                <cfg.icon className={`w-8 h-8 ${cfg.iconClass}`} />
                <div>
                  <p className="text-sm text-muted-foreground">Predicted Stress Level</p>
                  <p className={`text-3xl font-display font-bold ${cfg.iconClass}`}>{cfg.label}</p>
                </div>
              </div>

              {/* Stress meter */}
              <div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: cfg.width }} transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${cfg.barClass}`} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>LOW</span><span>MEDIUM</span><span>HIGH</span><span>CRITICAL</span>
                </div>
              </div>

              {result.message && (
                <div className="bg-card/70 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Assessment</p>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              )}
              {result.recommendation && (
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">Recommendation</p>
                  <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ResourcePrediction;
