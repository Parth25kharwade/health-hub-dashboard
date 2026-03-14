import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { getPatientHistory, getPatientsByDoctor, Patient } from "@/services/patientService";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Stethoscope, Pill, Activity, FlaskConical, Scissors, Camera, Loader2, FileX2, User, Calendar, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  CONSULTATION: Stethoscope,
  MEDICATION: Pill,
  LAB: FlaskConical,
  PROCEDURE: Scissors,
  IMAGING: Camera,
  GENERAL: Activity,
};

interface HistoryRecord {
  id: number;
  patientId: number;
  patientName: string;
  recordType: string;
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  allergies: string | null;
  filePath: string | null;
  visitDate: string;
  doctorName: string;
  createdAt: string;
}

const PatientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // For the patient selector (when no ID in URL)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientsLoading, setPatientsLoading] = useState(false);

  const activePatientId = id || selectedPatientId;

  // Load patients list when no ID in URL
  useEffect(() => {
    if (id) return; // Already have ID from URL
    if (!user?.userId) return;
    setPatientsLoading(true);
    getPatientsByDoctor(user.userId)
      .then(r => setPatients(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setPatients([]))
      .finally(() => setPatientsLoading(false));
  }, [id, user]);

  // Load history when we have a patient ID
  useEffect(() => {
    if (!activePatientId) return;
    setLoading(true);
    setError("");
    getPatientHistory(activePatientId)
      .then(r => {
        const records = Array.isArray(r.data?.data) ? r.data.data : [];
        setHistory(records);
      })
      .catch(() => setError("Failed to load patient history."))
      .finally(() => setLoading(false));
  }, [activePatientId]);

  const patientName = history.length > 0 ? history[0].patientName : "";

  return (
    <DashboardLayout title="Patient History">
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <Link to="/doctor/patients">
          <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Patients</Button>
        </Link>

        {/* Patient selector — shown when no ID in URL */}
        {!id && (
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Select Patient</h3>
                <p className="text-xs text-muted-foreground">Choose a patient to view their medical history</p>
              </div>
            </div>
            {patientsLoading ? (
              <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient…" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.fullName} {p.patientCode ? `(${p.patientCode})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div>
          <h2 className="text-xl font-display font-bold mb-1">
            {patientName ? `${patientName}'s Medical Timeline` : "Medical Timeline"}
          </h2>
          <p className="text-muted-foreground text-sm">Complete history of consultations, diagnoses and treatments</p>
        </div>

        {/* No patient selected */}
        {!activePatientId && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">Select a patient above</p>
            <p className="text-xs">Choose a patient to view their medical records timeline.</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading patient history…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-critical/10 flex items-center justify-center">
              <FileX2 className="w-6 h-6 text-critical" />
            </div>
            <p className="text-sm text-critical">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && activePatientId && history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <FileX2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">No medical records found</p>
            <p className="text-xs">This patient doesn't have any medical records yet.</p>
            <Link to="/doctor/records/new">
              <Button size="sm" className="gradient-primary border-0 text-primary-foreground mt-2">Create First Record</Button>
            </Link>
          </div>
        )}

        {/* Timeline */}
        {!loading && !error && history.length > 0 && (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {history.map((item, i) => {
                const Icon = iconMap[item.recordType] ?? Activity;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="relative flex gap-5">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 z-10 shadow-primary">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 bg-card rounded-xl border border-border p-5 shadow-card">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-display font-semibold">{item.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.visitDate}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> Dr. {item.doctorName}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">{item.recordType}</Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { label: "Diagnosis", value: item.diagnosis, color: "text-critical" },
                          { label: "Treatment", value: item.treatment, color: "text-success" },
                          { label: "Medications", value: item.medications, color: "text-primary" },
                        ].map(field => field.value && (
                          <div key={field.label} className="bg-muted rounded-lg px-3 py-2">
                            <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
                            <p className={`text-sm font-medium ${field.color}`}>{field.value}</p>
                          </div>
                        ))}
                      </div>
                      {item.allergies && (
                        <div className="mt-3 px-3 py-2 rounded-lg bg-critical/5 border border-critical/10">
                          <p className="text-xs text-muted-foreground mb-0.5">Allergies</p>
                          <p className="text-sm font-medium text-critical">{item.allergies}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientHistory;
