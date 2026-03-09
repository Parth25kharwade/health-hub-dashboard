import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getForecastHistory } from "@/services/resourceService";
import { useAuth } from "@/context/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const levelColor: Record<string, string> = { LOW: "text-success", MEDIUM: "text-warning", HIGH: "text-critical", CRITICAL: "text-critical" };
const levelBadge: Record<string, string> = { LOW: "bg-success/10 text-success border-success/20", MEDIUM: "bg-warning/10 text-warning border-warning/20", HIGH: "bg-critical/10 text-critical border-critical/20", CRITICAL: "bg-critical/10 text-critical border-critical/30" };

const ForecastHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const hid = user?.hospitalId ?? "H001";
    getForecastHistory(hid)
      .then(r => setHistory(r.data || []))
      .catch(() => setHistory([
        { date: "Mar 1", stressLevel: "LOW", icuLoad: 45, staffLoad: 55, score: 25 },
        { date: "Mar 3", stressLevel: "MEDIUM", icuLoad: 62, staffLoad: 68, score: 50 },
        { date: "Mar 5", stressLevel: "HIGH", icuLoad: 78, staffLoad: 82, score: 75 },
        { date: "Mar 7", stressLevel: "CRITICAL", icuLoad: 95, staffLoad: 91, score: 95 },
        { date: "Mar 9", stressLevel: "HIGH", icuLoad: 83, staffLoad: 79, score: 74 },
      ]));
  }, [user]);

  return (
    <DashboardLayout title="Forecast History">
      <div className="space-y-5 animate-fade-in">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Historical Stress Forecast</h3>
              <p className="text-xs text-muted-foreground">ICU load, staff load & stress score over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="icuLoad" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={{ r: 4 }} name="ICU Load %" />
              <Line type="monotone" dataKey="staffLoad" stroke="hsl(199 89% 38%)" strokeWidth={2} dot={{ r: 4 }} name="Staff Load %" />
              <Line type="monotone" dataKey="score" stroke="hsl(38 92% 50%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Stress Score" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h3 className="font-display font-semibold">Forecast Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  {["Date", "Stress Level", "ICU Load", "Staff Load", "Stress Score"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{row.date}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className={`text-xs ${levelBadge[row.stressLevel] ?? ""}`}>{row.stressLevel}</Badge>
                    </td>
                    <td className={`px-5 py-3 font-semibold ${levelColor[row.stressLevel]}`}>{row.icuLoad}%</td>
                    <td className="px-5 py-3">{row.staffLoad}%</td>
                    <td className={`px-5 py-3 font-bold ${levelColor[row.stressLevel]}`}>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ForecastHistory;
