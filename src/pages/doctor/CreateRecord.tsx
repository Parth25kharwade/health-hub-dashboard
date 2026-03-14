import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { createMedicalRecord } from "@/services/medicalRecordService";
import { getPatientsByDoctor, Patient } from "@/services/patientService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, FileText, Stethoscope, Pill, Calendar, ClipboardList, User, AlertCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RECORD_TYPES = [
  { value: "CONSULTATION", label: "Consultation", icon: "🩺" },
  { value: "LAB", label: "Lab Report", icon: "🧪" },
  { value: "IMAGING", label: "Imaging", icon: "📷" },
  { value: "MEDICATION", label: "Medication", icon: "💊" },
  { value: "PROCEDURE", label: "Procedure", icon: "🏥" },
  { value: "GENERAL", label: "General", icon: "📋" },
];

const initialForm = {
  patientId: "", recordType: "", title: "", description: "",
  diagnosis: "", treatment: "", medications: "", visitDate: "",
};

const CreateRecord = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [createdRecord, setCreatedRecord] = useState<any>(null);

  useEffect(() => {
    if (!user?.userId) return;
    getPatientsByDoctor(user.userId)
      .then(r => setPatients(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false));
  }, [user]);

  const selectedPatient = patients.find(p => String(p.id) === form.patientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, patientId: Number(form.patientId) };
      const response = await createMedicalRecord(payload);
      setCreatedRecord(response.data?.data || null);
      setSuccess(true);
      setForm(initialForm);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save record. Please try again.");
    } finally { setSaving(false); }
  };

  const handleReset = () => {
    setForm(initialForm);
    setError("");
    setSuccess(false);
    setCreatedRecord(null);
  };

  // Success state
  if (success && createdRecord) {
    return (
      <DashboardLayout title="Create Medical Record">
        <div className="max-w-2xl animate-fade-in">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border shadow-card p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-1">Record Created Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Medical record for <span className="font-medium text-foreground">{createdRecord.patientName}</span> has been saved.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-5 text-left space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Record ID:</span> <span className="font-medium">#{createdRecord.id}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{createdRecord.recordType}</span></div>
                <div><span className="text-muted-foreground">Doctor:</span> <span className="font-medium">{createdRecord.doctorName}</span></div>
                <div><span className="text-muted-foreground">Visit Date:</span> <span className="font-medium">{createdRecord.visitDate}</span></div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Title:</span> <span className="font-medium">{createdRecord.title}</span>
              </div>
              {createdRecord.diagnosis && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Diagnosis:</span> <span className="font-medium text-critical">{createdRecord.diagnosis}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Button onClick={handleReset} className="gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90 gap-2">
                <FileText className="w-4 h-4" /> Create Another Record
              </Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Medical Record">
      <div className="max-w-2xl space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">New Medical Record</h2>
              <p className="text-sm text-muted-foreground">Document patient visit details and clinical findings</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-critical/10 text-critical border border-critical/20 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Patient & Visit Info */}
          <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <User className="w-4 h-4" /> Patient & Visit Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Patient <span className="text-critical">*</span></Label>
                {loadingPatients ? (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading patients…
                  </div>
                ) : (
                  <Select value={form.patientId} onValueChange={v => setForm({ ...form, patientId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.fullName} {p.patientCode ? `(${p.patientCode})` : ""}
                        </SelectItem>
                      ))}
                      {patients.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No patients found</div>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {selectedPatient && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 mt-1 px-3 py-1.5 bg-primary/5 rounded-lg text-xs text-muted-foreground">
                    <span>{selectedPatient.gender}</span>
                    <span>•</span>
                    <span>Blood: {selectedPatient.bloodGroup}</span>
                    <span>•</span>
                    <span>{selectedPatient.phone}</span>
                  </motion.div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Record Type <span className="text-critical">*</span></Label>
                <Select value={form.recordType} onValueChange={v => setForm({ ...form, recordType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECORD_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">{t.icon} {t.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title <span className="text-critical">*</span></Label>
                <Input placeholder="e.g. Initial Visit - Fever & Fatigue" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Visit Date <span className="text-critical">*</span>
                </Label>
                <Input type="date" value={form.visitDate}
                  onChange={e => setForm({ ...form, visitDate: e.target.value })} required />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Details */}
          <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Stethoscope className="w-4 h-4" /> Clinical Details
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Describe the patient's presenting complaints, symptoms, observations…"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" /> Diagnosis
                </Label>
                <Textarea rows={2} placeholder="e.g. Suspected viral infection"
                  value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Treatment Plan</Label>
                <Textarea rows={2} placeholder="e.g. Antipyretics, rest, fluids"
                  value={form.treatment} onChange={e => setForm({ ...form, treatment: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Section 3: Medications */}
          <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Pill className="w-4 h-4" /> Medications
            </div>

            <div className="space-y-1.5">
              <Label>Prescribed Medications</Label>
              <Textarea rows={2} placeholder="e.g. Paracetamol 500mg TDS, Amoxicillin 250mg BD for 5 days"
                value={form.medications} onChange={e => setForm({ ...form, medications: e.target.value })} />
              <p className="text-xs text-muted-foreground">Enter medication name, dosage, and frequency. Separate multiple medications with commas.</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              Fields marked with <span className="text-critical">*</span> are required
            </p>
            <Button type="submit" className="gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90 px-8 gap-2" disabled={saving || !form.patientId || !form.recordType}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="w-4 h-4" /> Save Record</>}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateRecord;
