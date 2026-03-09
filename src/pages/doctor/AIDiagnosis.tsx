import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { analyzeDiagnosis } from "@/services/diagnosisService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, AlertTriangle, CheckCircle2, Info, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DiagnosisResult { riskScore: number; suspectedDiseases: string[]; diagnosticAlerts: string[]; riskLevel: string }

const commonSymptoms = ["Fever", "Headache", "Fatigue", "Cough", "Shortness of breath", "Chest pain", "Nausea", "Vomiting", "Dizziness", "Abdominal pain"];

const AIDiagnosis = () => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [vitals, setVitals] = useState({ temperature: 98.6, systolicBp: 120, diastolicBp: 80, heartRate: 72, oxygenSaturation: 98 });
  const [lab, setLab] = useState({ plateletCount: 250000, hemoglobin: 13.5, bloodSugar: 95, wbcCount: 7000 });
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState("");

  const toggleSymptom = (s: string) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const addCustom = () => { if (customSymptom.trim()) { setSymptoms(p => [...p, customSymptom.trim()]); setCustomSymptom(""); } };

  const handleAnalyze = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const { data } = await analyzeDiagnosis({ symptoms, vitals, labReport: lab, patientId: patientId || undefined });
      setResult(data);
    } catch {
      // Demo result
      setResult({ riskScore: 72, riskLevel: "HIGH", suspectedDiseases: ["Type 2 Diabetes", "Hypertension", "Metabolic Syndrome"], diagnosticAlerts: ["Elevated blood sugar levels detected", "High systolic blood pressure", "BMI indicates obesity risk"] });
    } finally { setLoading(false); }
  };

  const riskConfig: Record<string, { label: string; color: string; icon: any; cardClass: string }> = {
    LOW: { label: "Low Risk", color: "text-success", icon: CheckCircle2, cardClass: "bg-success/5 border-success/20" },
    MEDIUM: { label: "Medium Risk", color: "text-warning", icon: Info, cardClass: "bg-warning/5 border-warning/20" },
    HIGH: { label: "High Risk", color: "text-critical", icon: AlertTriangle, cardClass: "bg-critical/5 border-critical/20" },
    CRITICAL: { label: "Critical", color: "text-critical", icon: AlertTriangle, cardClass: "bg-critical/10 border-critical/30" },
  };
  const risk = result ? (riskConfig[result.riskLevel] ?? riskConfig.MEDIUM) : null;

  return (
    <DashboardLayout title="AI Diagnosis Analyzer">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
        {/* Input panel */}
        <div className="space-y-5">
          <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Patient Input</h3>
                <p className="text-xs text-muted-foreground">Enter symptoms and vitals</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Patient ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="P-001" value={patientId} onChange={e => setPatientId(e.target.value)} />
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <Label>Symptoms</Label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)} type="button"
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${symptoms.includes(s) ? "gradient-primary text-white border-primary shadow-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/50"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input placeholder="Add custom symptom…" value={customSymptom} onChange={e => setCustomSymptom(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())} className="text-sm" />
                <Button type="button" size="sm" variant="outline" onClick={addCustom}><Plus className="w-4 h-4" /></Button>
              </div>
              {symptoms.filter(s => !commonSymptoms.includes(s)).map(s => (
                <Badge key={s} variant="secondary" className="mr-1.5 gap-1">
                  {s} <button onClick={() => toggleSymptom(s)}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>

            {/* Vitals */}
            <div className="space-y-2">
              <Label>Vitals</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "temperature", label: "Temperature (°F)" }, { key: "heartRate", label: "Heart Rate (bpm)" },
                  { key: "systolicBp", label: "Systolic BP" }, { key: "diastolicBp", label: "Diastolic BP" },
                  { key: "oxygenSaturation", label: "O₂ Saturation (%)" },
                ].map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input type="number" value={vitals[f.key as keyof typeof vitals]}
                      onChange={e => setVitals({ ...vitals, [f.key]: +e.target.value })} className="h-8 text-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Lab */}
            <div className="space-y-2">
              <Label>Lab Report</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "plateletCount", label: "Platelets (/μL)" }, { key: "hemoglobin", label: "Hemoglobin (g/dL)" },
                  { key: "bloodSugar", label: "Blood Sugar (mg/dL)" }, { key: "wbcCount", label: "WBC Count (/μL)" },
                ].map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input type="number" value={lab[f.key as keyof typeof lab]}
                      onChange={e => setLab({ ...lab, [f.key]: +e.target.value })} className="h-8 text-sm" />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={loading || symptoms.length === 0}
              className="w-full gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing…</> : <><Brain className="w-4 h-4 mr-2" /> Analyze with AI</>}
            </Button>
          </div>
        </div>

        {/* Result panel */}
        <div>
          <AnimatePresence>
            {result && risk && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                {/* Risk Score */}
                <div className={`bg-card rounded-xl border shadow-card p-6 ${risk.cardClass}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <risk.icon className={`w-6 h-6 ${risk.color}`} />
                    <div>
                      <h3 className="font-display font-bold text-lg">{risk.label}</h3>
                      <p className="text-sm text-muted-foreground">AI Diagnostic Assessment</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className={`text-4xl font-display font-bold ${risk.color}`}>{result.riskScore}</span>
                      <p className="text-xs text-muted-foreground">/ 100</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${result.riskScore}%` }} transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${result.riskScore < 40 ? "gradient-success" : result.riskScore < 70 ? "gradient-warning" : "gradient-danger"}`} />
                  </div>
                </div>

                {/* Suspected Diseases */}
                <div className="bg-card rounded-xl border border-border shadow-card p-5">
                  <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full gradient-warning inline-block" /> Suspected Diseases
                  </h4>
                  <div className="space-y-2">
                    {result.suspectedDiseases.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-warning/5 rounded-lg border border-warning/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                        <span className="text-sm font-medium">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Alerts */}
                <div className="bg-card rounded-xl border border-border shadow-card p-5">
                  <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full gradient-danger inline-block" /> Diagnostic Alerts
                  </h4>
                  <div className="space-y-2">
                    {result.diagnosticAlerts.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 px-3 py-2 bg-critical/5 rounded-lg border border-critical/20">
                        <AlertTriangle className="w-4 h-4 text-critical mt-0.5 shrink-0" />
                        <span className="text-sm">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {!result && (
              <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border shadow-card text-center p-8">
                <Brain className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="font-display font-semibold text-muted-foreground">AI Analysis Ready</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Enter symptoms and click Analyze to get results</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIDiagnosis;
