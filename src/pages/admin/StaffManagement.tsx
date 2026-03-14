import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { updateStaffWorkload } from "@/services/resourceService";
import { useAuth } from "@/context/AuthContext";
import { useResource } from "@/context/ResourceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Users, AlertTriangle, ShieldAlert, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const departments = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "ICU", "Emergency", "Radiology"];

interface StaffResult {
  id: number;
  hospitalId: number;
  department: string;
  totalStaff: number;
  onDutyStaff: number;
  workloadPct: number;
  stressLevel: string;
}

const stressConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bar: string }> = {
  LOW:      { label: "Low",      color: "text-success",  icon: <CheckCircle2 className="w-4 h-4" />, bar: "gradient-success" },
  MODERATE: { label: "Moderate", color: "text-warning",  icon: <Activity className="w-4 h-4" />,     bar: "gradient-warning" },
  HIGH:     { label: "High",     color: "text-warning",  icon: <AlertTriangle className="w-4 h-4" />, bar: "gradient-warning" },
  CRITICAL: { label: "Critical", color: "text-critical", icon: <ShieldAlert className="w-4 h-4" />,  bar: "gradient-danger"  },
};

const StaffManagement = () => {
  const { user } = useAuth();
  const { refreshStaff } = useResource();
  const [form, setForm] = useState({ department: "", totalStaff: 0, onDutyStaff: 0 });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<StaffResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const localWorkloadPct = form.totalStaff > 0 ? Math.round((form.onDutyStaff / form.totalStaff) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        hospitalId: user?.hospitalId ?? 1,
        department: form.department,
        totalStaff: form.totalStaff,
        onDutyStaff: form.onDutyStaff,
      };
      const response = await updateStaffWorkload(payload);
      const data: StaffResult = response.data?.data ?? response.data;
      setResult(data);
      setSuccess(true);
      refreshStaff(); // 🔄 notify dashboard to re-fetch
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to update staff workload.");
    } finally {
      setSaving(false);
    }
  };

  const stress = result ? (stressConfig[result.stressLevel] ?? stressConfig["LOW"]) : null;

  return (
    <DashboardLayout title="Staff Workload Management">
      <div className="max-w-lg space-y-5 animate-fade-in">
        {/* Form Card */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Update Staff Workload</h3>
              <p className="text-xs text-muted-foreground">Track department staffing levels</p>
            </div>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 text-success border border-success/20 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Workload updated successfully!
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm"
              >
                <AlertTriangle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                required
              >
                <option value="">Select department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Total Staff</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.totalStaff}
                  onChange={e => setForm({ ...form, totalStaff: +e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>On-Duty Staff</Label>
                <Input
                  type="number"
                  min={0}
                  max={form.totalStaff}
                  value={form.onDutyStaff}
                  onChange={e => setForm({ ...form, onDutyStaff: +e.target.value })}
                  required
                />
              </div>
            </div>

            {form.totalStaff > 0 && (
              <div className="space-y-2 bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Workload Percentage</span>
                  <span className={`text-xl font-display font-bold ${localWorkloadPct >= 90 ? "text-critical" : localWorkloadPct >= 70 ? "text-warning" : "text-success"}`}>
                    {localWorkloadPct}%
                  </span>
                </div>
                <div className="h-3 bg-card rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${localWorkloadPct}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${localWorkloadPct >= 90 ? "gradient-danger" : localWorkloadPct >= 70 ? "gradient-warning" : "gradient-success"}`}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90"
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Workload"}
            </Button>
          </form>
        </div>

        {/* API Result Card */}
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
                  <h3 className="font-display font-semibold">Server Response</h3>
                  <p className="text-xs text-muted-foreground">{result.department} — Hospital #{result.hospitalId}</p>
                </div>
              </div>

              {/* Workload bar from server */}
              <div className="space-y-2 bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Server Workload %</span>
                  <span className={`text-xl font-display font-bold ${stress.color}`}>
                    {result.workloadPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-card rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.workloadPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={`h-full rounded-full ${stress.bar}`}
                  />
                </div>
              </div>

              {/* Stress Level Badge */}
              <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Stress Level</span>
                <span className={`flex items-center gap-1.5 font-semibold text-sm ${stress.color}`}>
                  {stress.icon}
                  {stress.label}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Staff</p>
                  <p className="text-2xl font-display font-bold">{result.totalStaff}</p>
                </div>
                <div className="bg-muted rounded-lg px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">On Duty</p>
                  <p className="text-2xl font-display font-bold">{result.onDutyStaff}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default StaffManagement;
