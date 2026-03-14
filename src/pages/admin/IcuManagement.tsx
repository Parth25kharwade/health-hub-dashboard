import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { updateIcuBeds } from "@/services/resourceService";
import { useAuth } from "@/context/AuthContext";
import { useResource } from "@/context/ResourceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BedDouble, Edit2, Loader2, CheckCircle2, AlertTriangle,
  ShieldAlert, Activity, Building2, Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IcuResult {
  id: number;
  hospitalId: number;
  hospitalName: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  utilizationPct: number;
  stressLevel: string;
}

const stressConfig: Record<string, { label: string; color: string; bar: string; icon: React.ReactNode }> = {
  LOW:      { label: "Low",      color: "text-success",  bar: "gradient-success", icon: <CheckCircle2 className="w-4 h-4" /> },
  MODERATE: { label: "Moderate", color: "text-warning",  bar: "gradient-warning", icon: <Activity className="w-4 h-4" /> },
  HIGH:     { label: "High",     color: "text-warning",  bar: "gradient-warning", icon: <AlertTriangle className="w-4 h-4" /> },
  CRITICAL: { label: "Critical", color: "text-critical", bar: "gradient-danger",  icon: <ShieldAlert className="w-4 h-4" /> },
};

const IcuManagement = () => {
  const { user } = useAuth();
  const { icuData, refreshIcu } = useResource();

  const [form, setForm] = useState({ totalBeds: 0, occupiedBeds: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<IcuResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form from live context data whenever ICU data changes
  useEffect(() => {
    if (icuData) {
      setForm({ totalBeds: icuData.totalBeds, occupiedBeds: icuData.occupiedBeds });
    }
  }, [icuData]);

  const openModal = () => {
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        hospitalId: user?.hospitalId ?? 1,
        totalBeds: form.totalBeds,
        occupiedBeds: form.occupiedBeds,
      };
      const response = await updateIcuBeds(payload);
      const data: IcuResult = response.data?.data ?? response.data;
      setResult(data);
      setSuccess(true);
      refreshIcu(); // 🔄 notify dashboard to re-fetch ICU chart
      setModalOpen(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to update ICU beds.");
    } finally {
      setSaving(false);
    }
  };

  // Show live context data if no update result yet, else show the update result
  const display: IcuResult | null = result ?? (icuData as IcuResult | null);
  const stress = display ? (stressConfig[display.stressLevel] ?? stressConfig["LOW"]) : null;
  const utilizationPct = display?.utilizationPct ?? 0;

  return (
    <DashboardLayout title="ICU Resource Management">
      <div className="max-w-2xl space-y-5 animate-fade-in">

        {/* ── Status Card ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-danger flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold">ICU Bed Status</h3>
                <p className="text-xs text-muted-foreground">
                  {display?.hospitalName ? `${display.hospitalName} · Real-time occupancy` : "Real-time occupancy"}
                </p>
              </div>
            </div>
            <Button onClick={openModal} variant="outline" size="sm" className="gap-1.5">
              <Edit2 className="w-3.5 h-3.5" /> Update
            </Button>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 text-success border border-success/20 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> ICU beds updated successfully!
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm"
              >
                <AlertTriangle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Beds",  value: display?.totalBeds    ?? "—", color: "text-foreground" },
              { label: "Occupied",    value: display?.occupiedBeds  ?? "—", color: "text-critical"   },
              { label: "Available",   value: display?.availableBeds ?? "—", color: "text-success"    },
            ].map(s => (
              <div key={s.label} className="bg-muted rounded-xl p-4 text-center">
                <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Utilization bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Utilization Rate</span>
              <span className={`text-sm font-bold ${utilizationPct >= 90 ? "text-critical" : utilizationPct >= 70 ? "text-warning" : "text-success"}`}>
                {display ? `${utilizationPct.toFixed(1)}%` : "—"}
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(utilizationPct, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${utilizationPct >= 90 ? "gradient-danger" : utilizationPct >= 70 ? "gradient-warning" : "gradient-success"}`}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {utilizationPct >= 90
                ? "⚠️ Critical occupancy — consider patient transfers"
                : utilizationPct >= 70
                ? "ICU near capacity — monitor closely"
                : "ICU capacity within normal range"}
            </p>
          </div>

          {/* Stress badge + hospital meta */}
          {display && stress && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Stress Level</span>
                <span className={`flex items-center gap-1.5 font-semibold text-sm ${stress.color}`}>
                  {stress.icon} {stress.label}
                </span>
              </div>
              <div className="bg-muted rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />Hospital</span>
                <span className="font-semibold text-sm truncate ml-2">{display.hospitalName || `ID ${display.hospitalId}`}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Server Response Card (shown after update) ─────────────────────── */}
        <AnimatePresence>
          {result && stress && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-xl border border-border shadow-card p-6 space-y-4"
            >
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Last Update Response</h3>
                  <p className="text-xs text-muted-foreground">{result.hospitalName} · Record #{result.id}</p>
                </div>
              </div>

              {/* Utilization from server */}
              <div className="space-y-2 bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Server Utilization %</span>
                  <span className={`text-xl font-display font-bold ${stress.color}`}>
                    {result.utilizationPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-card rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.utilizationPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={`h-full rounded-full ${stress.bar}`}
                  />
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Beds",       value: result.totalBeds },
                  { label: "Occupied",          value: result.occupiedBeds },
                  { label: "Available",         value: result.availableBeds },
                  { label: "Record ID",         value: `#${result.id}`, icon: <Hash className="w-3 h-3" /> },
                ].map(item => (
                  <div key={item.label} className="bg-muted rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-2xl font-display font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Update Dialog (inline, not Radix Dialog to avoid hospitalId field ─ */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1,    y: 0 }}
                exit={{ opacity: 0,   scale: 0.95, y: 12 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
                className="bg-card rounded-xl border border-border shadow-card p-6 w-full max-w-sm space-y-4 mx-4"
              >
                <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  <div className="w-9 h-9 rounded-lg gradient-danger flex items-center justify-center">
                    <BedDouble className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Update ICU Beds</h3>
                    <p className="text-xs text-muted-foreground">Hospital ID: {user?.hospitalId ?? 1}</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Total Beds</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.totalBeds}
                      onChange={e => setForm({ ...form, totalBeds: +e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Occupied Beds</Label>
                    <Input
                      type="number"
                      min={0}
                      max={form.totalBeds || undefined}
                      value={form.occupiedBeds}
                      onChange={e => setForm({ ...form, occupiedBeds: +e.target.value })}
                      required
                    />
                  </div>

                  {/* Live preview bar */}
                  {form.totalBeds > 0 && (
                    <div className="space-y-1.5 bg-muted rounded-lg p-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Preview utilization</span>
                        <span className="font-semibold">
                          {Math.round((form.occupiedBeds / form.totalBeds) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-card rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            (form.occupiedBeds / form.totalBeds) >= 0.9 ? "gradient-danger"
                            : (form.occupiedBeds / form.totalBeds) >= 0.7 ? "gradient-warning"
                            : "gradient-success"
                          }`}
                          animate={{ width: `${Math.min((form.occupiedBeds / form.totalBeds) * 100, 100)}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-1">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button
                      type="submit"
                      className="gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default IcuManagement;
