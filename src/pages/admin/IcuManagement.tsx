import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getIcuStatus, updateIcuBeds } from "@/services/resourceService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BedDouble, Edit2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const IcuManagement = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ totalBeds: 0, occupiedBeds: 0, hospitalId: "" });
  const [saving, setSaving] = useState(false);

  const fetchStatus = () => {
    const hid = user?.hospitalId ?? "H001";
    getIcuStatus(hid)
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ totalBeds: 30, occupiedBeds: 22, availableBeds: 8, occupancyRate: 73 }));
  };

  useEffect(() => { fetchStatus(); }, [user]);

  const openModal = () => {
    setForm({ totalBeds: status?.totalBeds ?? 30, occupiedBeds: status?.occupiedBeds ?? 22, hospitalId: user?.hospitalId ?? "H001" });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await updateIcuBeds(form); fetchStatus(); setModalOpen(false); }
    catch { } finally { setSaving(false); }
  };

  const occupancy = status ? Math.round((status.occupiedBeds / status.totalBeds) * 100) : 0;

  return (
    <DashboardLayout title="ICU Resource Management">
      <div className="max-w-2xl space-y-5 animate-fade-in">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-danger flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold">ICU Bed Status</h3>
                <p className="text-xs text-muted-foreground">Real-time occupancy</p>
              </div>
            </div>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openModal} variant="outline" size="sm" className="gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Update ICU Beds</DialogTitle></DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 mt-2">
                  <div className="space-y-1.5"><Label>Total Beds</Label><Input type="number" value={form.totalBeds} onChange={e => setForm({ ...form, totalBeds: +e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Occupied Beds</Label><Input type="number" value={form.occupiedBeds} onChange={e => setForm({ ...form, occupiedBeds: +e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Hospital ID</Label><Input value={form.hospitalId} onChange={e => setForm({ ...form, hospitalId: e.target.value })} /></div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="gradient-primary border-0 text-primary-foreground" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Big numbers */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Beds", value: status?.totalBeds ?? "—", color: "text-foreground" },
              { label: "Occupied", value: status?.occupiedBeds ?? "—", color: "text-critical" },
              { label: "Available", value: status?.availableBeds ?? "—", color: "text-success" },
            ].map(s => (
              <div key={s.label} className="bg-muted rounded-xl p-4 text-center">
                <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Occupancy bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Occupancy Rate</span>
              <span className={`text-sm font-bold ${occupancy > 85 ? "text-critical" : occupancy > 70 ? "text-warning" : "text-success"}`}>{occupancy}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${occupancy}%` }} transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${occupancy > 85 ? "gradient-danger" : occupancy > 70 ? "gradient-warning" : "gradient-success"}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {occupancy > 85 ? "⚠️ Critical occupancy — consider patient transfers" : occupancy > 70 ? "ICU near capacity — monitor closely" : "ICU capacity within normal range"}
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default IcuManagement;
