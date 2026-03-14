import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { explainLabReport } from "@/services/diagnosisService";
import { getPatientsByDoctor, Patient } from "@/services/patientService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, AlertTriangle, FlaskConical, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const labFields = [
  { key: "hemoglobin", label: "Hemoglobin (g/dL)", placeholder: "e.g. 11.2" },
  { key: "plateletCount", label: "Platelet Count (/μL)", placeholder: "e.g. 75000" },
  { key: "whiteBloodCellCount", label: "WBC Count (/μL)", placeholder: "e.g. 4200" },
  { key: "bloodSugar", label: "Blood Sugar (mg/dL)", placeholder: "e.g. 160" },
  { key: "cholesterol", label: "Cholesterol (mg/dL)", placeholder: "e.g. 230" },
];

const LabReportExplainer = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [lab, setLab] = useState<Record<string, string>>({ hemoglobin: "", plateletCount: "", whiteBloodCellCount: "", bloodSugar: "", cholesterol: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.userId) return;
    getPatientsByDoctor(user.userId)
      .then(r => setPatients(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setPatients([]));
  }, [user]);

  const hasAnyLabValue = Object.values(lab).some(v => v !== "");

  const handleExplain = async () => {
    if (!selectedPatientId || !hasAnyLabValue) return;
    setLoading(true); setError(""); setResult("");
    try {
      const labReport: Record<string, number> = {};
      Object.entries(lab).forEach(([k, v]) => { if (v !== "") labReport[k] = Number(v); });

      const { data } = await explainLabReport({
        patientId: Number(selectedPatientId),
        labReport,
      });
      setResult(typeof data === "string" ? data : JSON.stringify(data));
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || "Analysis failed. Please try again.");
    } finally { setLoading(false); }
  };

  const selectedPatient = patients.find(p => String(p.id) === selectedPatientId);

  const handlePrint = () => {
    if (!result || !selectedPatient) return;
    const labEntries = Object.entries(lab)
      .filter(([, v]) => v !== "")
      .map(([k, v]) => {
        const field = labFields.find(f => f.key === k);
        return `<tr><td style="padding:6px 12px;border:1px solid #ddd;">${field?.label || k}</td><td style="padding:6px 12px;border:1px solid #ddd;font-weight:600;">${v}</td></tr>`;
      }).join("");

    const printContent = `
      <!DOCTYPE html>
      <html><head><title>Lab Report - ${selectedPatient.fullName}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #1a1a1a; }
        .header { text-align: center; border-bottom: 3px solid #6d28d9; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { color: #6d28d9; margin: 0 0 4px; font-size: 22px; }
        .header p { color: #666; margin: 0; font-size: 13px; }
        .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8f7ff; border: 1px solid #e9e5f5; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
        .patient-info .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .patient-info .value { font-size: 14px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
        table th { background: #6d28d9; color: white; padding: 8px 12px; text-align: left; }
        .analysis { line-height: 1.7; font-size: 14px; }
        .analysis h2, .analysis h3 { color: #6d28d9; }
        .analysis strong { color: #1a1a1a; }
        .analysis hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
        .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
        @media print { body { padding: 16px; } }
      </style></head><body>
        <div class="header">
          <h1>🏥 MedCare AI Intelligence</h1>
          <p>Lab Report Analysis — Powered by Gemini 2.5 Flash</p>
        </div>
        <h3 style="margin:0 0 12px;color:#333;">Patient Information</h3>
        <div class="patient-info">
          <div><div class="label">Full Name</div><div class="value">${selectedPatient.fullName}</div></div>
          <div><div class="label">Patient Code</div><div class="value">${selectedPatient.patientCode || '—'}</div></div>
          <div><div class="label">Date of Birth</div><div class="value">${selectedPatient.dateOfBirth || '—'}</div></div>
          <div><div class="label">Gender</div><div class="value">${selectedPatient.gender || '—'}</div></div>
          <div><div class="label">Blood Group</div><div class="value">${selectedPatient.bloodGroup || '—'}</div></div>
          <div><div class="label">Phone</div><div class="value">${selectedPatient.phone || '—'}</div></div>
        </div>
        <h3 style="margin:0 0 12px;color:#333;">Lab Values Submitted</h3>
        <table>
          <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
          <tbody>${labEntries}</tbody>
        </table>
        <h3 style="margin:0 0 12px;color:#333;">AI Analysis</h3>
        <div class="analysis">${result.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/^---$/gm, '<hr>').replace(/^#{1,3}\s(.+)$/gm, (_, t) => `<h3>${t}</h3>`)}</div>
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()} | This report is AI-generated and should be reviewed by a qualified medical professional.</p>
        </div>
      </body></html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
  };

  return (
    <DashboardLayout title="Lab Report Explainer">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Input Panel */}
        <div className="space-y-5">
          <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">Lab Report Explainer</h2>
                <p className="text-xs text-muted-foreground">Powered by Gemini 2.5 Flash — explains each lab value in detail</p>
              </div>
            </div>

            {/* Patient Selector */}
            <div className="space-y-2">
              <Label>Patient <span className="text-critical">*</span></Label>
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
            </div>

            {/* Lab Values */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-muted-foreground" />
                <Label>Lab Report Values</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {labFields.map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input type="number" step="any" placeholder={f.placeholder} value={lab[f.key] || ""}
                      onChange={e => setLab({ ...lab, [f.key]: e.target.value })} className="h-9 text-sm" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">Only fill available values — empty fields are excluded.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-critical/10 text-critical border border-critical/20 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <Button onClick={handleExplain} disabled={loading || !selectedPatientId || !hasAnyLabValue}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 border-0 text-white shadow-lg hover:opacity-90 transition-opacity">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing with Gemini…</> : <><Sparkles className="w-4 h-4 mr-2" /> Explain Lab Report</>}
            </Button>
          </div>
        </div>

        {/* Result Panel */}
        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold">Gemini Analysis</h3>
                    {selectedPatient && <p className="text-xs text-muted-foreground">{selectedPatient.fullName}</p>}
                  </div>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-xs">
                    <Printer className="w-3.5 h-3.5" /> Print Summary
                  </Button>
                </div>
                {/* Markdown body */}
                <div className="px-6 py-5 prose prose-sm dark:prose-invert max-w-none
                  prose-headings:font-display prose-headings:text-foreground
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-li:text-foreground/85 prose-p:text-foreground/85
                  prose-h2:text-lg prose-h3:text-base
                  prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
                  prose-p:my-2 prose-hr:my-4">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 bg-card rounded-xl border border-border shadow-card text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                  <FlaskConical className="w-8 h-8 text-violet-400" />
                </div>
                <p className="font-display font-semibold text-muted-foreground">Lab Report Explainer</p>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">Select a patient and enter lab values to get a detailed AI-powered explanation of each parameter</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabReportExplainer;
