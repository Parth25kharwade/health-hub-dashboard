import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { createMedicalRecord } from "@/services/medicalRecordService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CreateRecord = () => {
  const [form, setForm] = useState({
    patientId: "", recordType: "", title: "", description: "",
    diagnosis: "", treatment: "", medications: "", visitDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await createMedicalRecord(form);
      setSuccess(true);
      setForm({ patientId: "", recordType: "", title: "", description: "", diagnosis: "", treatment: "", medications: "", visitDate: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save record.");
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Medical Record">
      <div className="max-w-2xl space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">New Medical Record</h2>
            <p className="text-sm text-muted-foreground">Document patient visit details</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 text-success border border-success/20 mb-4 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Record created successfully!
              </motion.div>
            )}
          </AnimatePresence>
          {error && <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 text-critical text-sm border border-critical/20">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Patient ID</Label>
                <Input placeholder="e.g. P-001" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Record Type</Label>
                <Select value={form.recordType} onValueChange={v => setForm({ ...form, recordType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {["CONSULTATION", "LAB", "IMAGING", "MEDICATION", "PROCEDURE", "GENERAL"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input placeholder="Record title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Visit Date</Label>
                <Input type="date" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Clinical description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Diagnosis</Label>
                <Textarea rows={2} placeholder="Primary diagnosis" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Treatment</Label>
                <Textarea rows={2} placeholder="Treatment plan" value={form.treatment} onChange={e => setForm({ ...form, treatment: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Medications</Label>
              <Input placeholder="e.g. Amlodipine 5mg, Metformin 500mg" value={form.medications} onChange={e => setForm({ ...form, medications: e.target.value })} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" className="gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90 px-8" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Record"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateRecord;
