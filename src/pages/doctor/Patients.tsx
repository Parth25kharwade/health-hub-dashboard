import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getPatientsByDoctor, createPatient, updatePatient, Patient } from "@/services/patientService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit2, Eye, Loader2, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const emptyForm: Patient = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  phone: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
};

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState<Patient>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPatients = () => {
    if (!user?.userId) return;
    getPatientsByDoctor(user.userId)
      .then(r => setPatients(Array.isArray(r.data?.data) ? r.data.data : r.data?.data ?? []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, [user]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: Patient) => { setEditingId(p.id!); setForm(p); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) {
        await updatePatient(editingId, form);
      } else {
        await createPatient({
          ...form,
          doctorId: user?.userId,
          hospitalId: user?.hospitalId,
        });
      }
      fetchPatients(); setModalOpen(false);
    } catch { } finally { setSaving(false); }
  };

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return p.fullName?.toLowerCase().includes(q) || p.patientCode?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout title="Patient Management">
      <div className="space-y-5 animate-fade-in">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-1.5" /> Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Patient" : "Add New Patient"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 mt-2">
                <div className="space-y-1.5"><Label>Full Name</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required /></div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Blood Group</Label>
                    <Select value={form.bloodGroup} onValueChange={v => setForm({ ...form, bloodGroup: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
                </div>
                <div className="space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Emergency Contact</Label><Input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Emergency Phone</Label><Input value={form.emergencyPhone} onChange={e => setForm({ ...form, emergencyPhone: e.target.value })} /></div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="gradient-primary border-0 text-primary-foreground" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Save Changes" : "Create Patient"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  {["Patient", "Gender", "Blood Group", "Phone", "Hospital", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No patients found</td></tr>
                )}
                {filtered.map((p, i) => (
                  <motion.tr key={p.id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                          <UserCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-medium">{p.fullName}</span>
                          {p.patientCode && <p className="text-xs text-muted-foreground">{p.patientCode}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary">{p.gender}</Badge>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{p.bloodGroup}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.phone}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{p.hospitalName || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={p.isActive ? "default" : "secondary"} className={p.isActive ? "bg-success/15 text-success border-success/20 hover:bg-success/20" : ""}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(p)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Link to={`/doctor/patients/${p.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Patients;
