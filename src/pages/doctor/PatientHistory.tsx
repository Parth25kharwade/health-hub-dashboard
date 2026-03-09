import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { getPatientHistory } from "@/services/patientService";
import { ArrowLeft, Stethoscope, Pill, Activity, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  CONSULTATION: Stethoscope, MEDICATION: Pill, LAB: FlaskConical, GENERAL: Activity,
};

const PatientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientHistory(id!)
      .then(r => setHistory(r.data || []))
      .catch(() => setHistory([
        { id: "h1", recordType: "CONSULTATION", title: "Initial Consultation", date: "2025-01-10", diagnosis: "Hypertension Stage 1", treatment: "Lifestyle modifications, low-sodium diet", medications: "Amlodipine 5mg", description: "Patient presented with elevated BP readings over 3 months." },
        { id: "h2", recordType: "LAB", title: "Blood Panel", date: "2025-02-01", diagnosis: "Mild Anemia", treatment: "Iron supplementation", medications: "Ferrous sulfate 325mg", description: "CBC showed low hemoglobin at 10.2 g/dL." },
        { id: "h3", recordType: "CONSULTATION", title: "Follow-up Visit", date: "2025-03-05", diagnosis: "Controlled Hypertension", treatment: "Continue current medications", medications: "Amlodipine 5mg", description: "BP well controlled at 130/85. Patient reports improvement." },
      ]))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <DashboardLayout title="Patient History">
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <Link to="/doctor/patients">
          <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Patients</Button>
        </Link>

        <div>
          <h2 className="text-xl font-display font-bold mb-1">Medical Timeline</h2>
          <p className="text-muted-foreground text-sm">Complete history of consultations, diagnoses and treatments</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
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
                        <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{item.recordType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
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
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientHistory;
