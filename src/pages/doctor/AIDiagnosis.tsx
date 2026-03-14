import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { analyzeDiagnosis, getDiagnosisHistory, DiagnosisResult, DiagnosisHistoryItem } from "@/services/diagnosisService";
import { getPatientsByDoctor, Patient } from "@/services/patientService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, AlertTriangle, CheckCircle2, Info, Plus, X, Lightbulb, User, Clock, History, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const commonSymptoms = ["fever", "headache", "fatigue", "cough", "shortness of breath", "chest pain", "nausea", "vomiting", "dizziness", "abdominal pain", "rash", "joint pain"];

const AIDiagnosis = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [vitals, setVitals] = useState({ temperature: 37.0, systolicBp: 120, diastolicBp: 80, heartRate: 72, oxygenSaturation: 98, respiratoryRate: "" as string | number });
  const [includeLab, setIncludeLab] = useState(true);
  const [lab, setLab] = useState<Record<string, string | number>>({
    hemoglobin: "", plateletCount: "", wbcCount: "", bloodSugar: "",
    creatinine: "", bilirubin: "", alt: "", reportDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.userId) return;
    getPatientsByDoctor(user.userId)
      .then(r => setPatients(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setPatients([]));
  }, [user]);

  // Load diagnosis history when patient is selected
  useEffect(() => {
    if (!selectedPatientId) { setHistory([]); return; }
    setHistoryLoading(true);
    getDiagnosisHistory(selectedPatientId)
      .then(r => setHistory(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [selectedPatientId]);

  const toggleSymptom = (s: string) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const addCustom = () => { if (customSymptom.trim()) { setSymptoms(p => [...p, customSymptom.trim().toLowerCase()]); setCustomSymptom(""); } };

  const handleAnalyze = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const vitalsPayload: any = {
        temperature: vitals.temperature,
        systolicBp: vitals.systolicBp,
        diastolicBp: vitals.diastolicBp,
        heartRate: vitals.heartRate,
        oxygenSaturation: vitals.oxygenSaturation,
      };
      if (vitals.respiratoryRate !== "" && vitals.respiratoryRate !== 0) {
        vitalsPayload.respiratoryRate = Number(vitals.respiratoryRate);
      }
      // Build lab payload — only include fields that have values
      let labPayload: any = null;
      if (includeLab) {
        labPayload = {} as any;
        const numericLabKeys = ["hemoglobin", "plateletCount", "wbcCount", "bloodSugar", "creatinine", "bilirubin", "alt"];
        numericLabKeys.forEach(k => {
          if (lab[k] !== "" && lab[k] !== undefined) labPayload[k] = Number(lab[k]);
        });
        if (lab.reportDate) labPayload.reportDate = lab.reportDate;
      }
      const payload = {
        symptoms,
        vitals: vitalsPayload,
        labReport: labPayload,
        ...(selectedPatientId ? { patientId: Number(selectedPatientId) } : {}),
      };
      const { data: res } = await analyzeDiagnosis(payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
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
                <p className="text-xs text-muted-foreground">Enter symptoms, vitals, and lab data</p>
              </div>
            </div>

            {/* Patient selector */}
            <div className="space-y-1.5">
              <Label>Patient <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
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

            {/* Symptoms */}
            <div className="space-y-2">
              <Label>Symptoms <span className="text-critical">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)} type="button"
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${symptoms.includes(s) ? "gradient-primary text-white border-primary shadow-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/50"}`}>
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
                <Badge key={s} variant="secondary" className="mr-1.5 gap-1 capitalize">
                  {s} <button onClick={() => toggleSymptom(s)}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>

            {/* Vitals */}
            <div className="space-y-2">
              <Label>Vitals</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: "temperature", label: "Temperature (°C)" }, { key: "heartRate", label: "Heart Rate (bpm)" },
                  { key: "systolicBp", label: "Systolic BP" }, { key: "diastolicBp", label: "Diastolic BP" },
                  { key: "oxygenSaturation", label: "O₂ Saturation (%)" },
                ].map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input type="number" step="any" value={vitals[f.key as keyof typeof vitals]}
                      onChange={e => setVitals({ ...vitals, [f.key]: +e.target.value })} className="h-8 text-sm" />
                  </div>
                ))}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Respiratory Rate <span className="text-muted-foreground/60">(optional)</span></Label>
                  <Input type="number" step="any" placeholder="e.g. 18" value={vitals.respiratoryRate}
                    onChange={e => setVitals({ ...vitals, respiratoryRate: e.target.value === "" ? "" : +e.target.value })} className="h-8 text-sm" />
                </div>
              </div>
            </div>

            {/* Lab */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lab Report</Label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={includeLab} onChange={e => setIncludeLab(e.target.checked)}
                    className="rounded border-border" />
                  <span className="text-muted-foreground text-xs">Include lab data</span>
                </label>
              </div>
              {includeLab && (
                <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "hemoglobin", label: "Hemoglobin (g/dL)" }, { key: "plateletCount", label: "Platelets (/μL)" },
                    { key: "wbcCount", label: "WBC Count (/μL)" }, { key: "bloodSugar", label: "Blood Sugar (mg/dL)" },
                    { key: "creatinine", label: "Creatinine (mg/dL)" }, { key: "bilirubin", label: "Bilirubin (mg/dL)" },
                    { key: "alt", label: "ALT (U/L)" },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{f.label}</Label>
                      <Input type="number" step="any" placeholder="—" value={lab[f.key] ?? ""}
                        onChange={e => setLab({ ...lab, [f.key]: e.target.value === "" ? "" : +e.target.value })} className="h-8 text-sm" />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Report Date</Label>
                    <Input type="date" value={lab.reportDate}
                      onChange={e => setLab({ ...lab, reportDate: e.target.value })} className="h-8 text-sm" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic mt-1">Only fill in available lab values — empty fields won't be sent.</p>
                </>
              )}
              {!includeLab && (
                <p className="text-xs text-muted-foreground italic px-1">Lab report will be sent as null — useful for vitals-only assessments like cardiac risk.</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-critical/10 text-critical border border-critical/20 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

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
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${result.riskScore}%` }} transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${result.riskScore < 40 ? "gradient-success" : result.riskScore < 70 ? "gradient-warning" : "gradient-danger"}`} />
                  </div>
                  {/* Patient & time info */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {result.patientName && (
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {result.patientName}</span>
                    )}
                    {result.analyzedAt && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(result.analyzedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Suspected Conditions */}
                {result.suspectedConditions?.length > 0 && (
                  <div className="bg-card rounded-xl border border-border shadow-card p-5">
                    <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full gradient-warning inline-block" /> Suspected Conditions
                    </h4>
                    <div className="space-y-2">
                      {result.suspectedConditions.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-warning/5 rounded-lg border border-warning/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                          <span className="text-sm font-medium">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnostic Alerts */}
                {result.diagnosticAlerts?.length > 0 && (
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
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div className="bg-card rounded-xl border border-border shadow-card p-5">
                    <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full gradient-primary inline-block" /> Recommendations
                    </h4>
                    <div className="space-y-2">
                      {result.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                          <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {!result && (
              <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border shadow-card text-center p-8">
                <Brain className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="font-display font-semibold text-muted-foreground">AI Analysis Ready</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Select symptoms and click Analyze to get AI-powered diagnostic insights</p>
              </div>
            )}
          </AnimatePresence>

          {/* Diagnosis History */}
          {selectedPatientId && (
            <div className="mt-6 bg-card rounded-xl border border-border shadow-card">
              <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Diagnosis History</h3>
                {history.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">{history.length} analyses</Badge>
                )}
              </div>
              {historyLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!historyLoading && history.length === 0 && (
                <p className="px-6 py-8 text-center text-muted-foreground text-sm">No diagnosis history for this patient</p>
              )}
              {!historyLoading && history.length > 0 && (
                <div className="divide-y divide-border">
                  {history.map((h) => {
                    const riskCfg = riskConfig[h.riskLevel] ?? riskConfig.MEDIUM;
                    const isExpanded = expandedHistoryId === h.id;
                    const conditions = h.suspectedConditions ? h.suspectedConditions.split(" | ") : [];
                    const alerts = h.diagnosticAlerts ? h.diagnosticAlerts.split(" | ") : [];
                    const recs = h.recommendations ? h.recommendations.split(" | ") : [];
                    return (
                      <div key={h.id}>
                        <button onClick={() => setExpandedHistoryId(isExpanded ? null : h.id)}
                          className="flex items-center gap-4 w-full px-6 py-4 hover:bg-muted/40 transition-colors text-left">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${h.riskLevel === "CRITICAL" || h.riskLevel === "HIGH" ? "gradient-danger" : h.riskLevel === "MEDIUM" ? "gradient-warning" : "gradient-success"}`}>
                            <riskCfg.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-display font-bold ${riskCfg.color}`}>{h.riskScore}</span>
                              <Badge variant="secondary" className="text-xs">{h.riskLevel}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{conditions[0] || "\u2014"}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">{new Date(h.analyzedAt).toLocaleString()}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="px-6 pb-5 space-y-3">
                                {conditions.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Suspected Conditions</p>
                                    <div className="space-y-1">
                                      {conditions.map((c, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-warning/5 rounded-lg border border-warning/20 text-sm">{c}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {alerts.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Diagnostic Alerts</p>
                                    <div className="space-y-1">
                                      {alerts.map((a, i) => (
                                        <div key={i} className="flex items-start gap-2 px-3 py-1.5 bg-critical/5 rounded-lg border border-critical/20 text-sm">
                                          <AlertTriangle className="w-3.5 h-3.5 text-critical mt-0.5 shrink-0" />{a}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {recs.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Recommendations</p>
                                    <div className="space-y-1">
                                      {recs.map((r, i) => (
                                        <div key={i} className="flex items-start gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                                          <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />{r}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIDiagnosis;
