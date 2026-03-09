import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { updateStaffWorkload } from "@/services/resourceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const departments = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "ICU", "Emergency", "Radiology"];

const StaffManagement = () => {
  const [form, setForm] = useState({ department: "", totalStaff: 0, onDutyStaff: 0 });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const workloadPct = form.totalStaff > 0 ? Math.round((form.onDutyStaff / form.totalStaff) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await updateStaffWorkload(form); setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
    catch { } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Staff Workload Management">
      <div className="max-w-lg space-y-5 animate-fade-in">
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
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 text-success border border-success/20 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Workload updated successfully!
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                <option value="">Select department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Total Staff</Label>
                <Input type="number" min={0} value={form.totalStaff} onChange={e => setForm({ ...form, totalStaff: +e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>On-Duty Staff</Label>
                <Input type="number" min={0} max={form.totalStaff} value={form.onDutyStaff} onChange={e => setForm({ ...form, onDutyStaff: +e.target.value })} required />
              </div>
            </div>

            {form.totalStaff > 0 && (
              <div className="space-y-2 bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Workload Percentage</span>
                  <span className={`text-xl font-display font-bold ${workloadPct >= 90 ? "text-critical" : workloadPct >= 70 ? "text-warning" : "text-success"}`}>{workloadPct}%</span>
                </div>
                <div className="h-3 bg-card rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${workloadPct}%` }} transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${workloadPct >= 90 ? "gradient-danger" : workloadPct >= 70 ? "gradient-warning" : "gradient-success"}`} />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Workload"}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffManagement;
