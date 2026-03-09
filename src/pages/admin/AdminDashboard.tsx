import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { getAdminDashboard } from "@/services/dashboardService";
import { useAuth } from "@/context/AuthContext";
import { BedDouble, Users, Cpu, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { motion } from "framer-motion";

const icuData = [
  { time: "00:00", occupied: 18, total: 24 }, { time: "04:00", occupied: 20, total: 24 },
  { time: "08:00", occupied: 22, total: 24 }, { time: "12:00", occupied: 21, total: 24 },
  { time: "16:00", occupied: 23, total: 24 }, { time: "20:00", occupied: 19, total: 24 }, { time: "Now", occupied: 20, total: 24 },
];

const staffData = [
  { dept: "Cardio", total: 12, onDuty: 8 }, { dept: "Neuro", total: 10, onDuty: 6 },
  { dept: "Ortho", total: 8, onDuty: 5 }, { dept: "Peds", total: 14, onDuty: 10 }, { dept: "ICU", total: 9, onDuty: 9 },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const hid = user?.hospitalId ?? "H001";
    getAdminDashboard(hid)
      .then(r => setData(r.data))
      .catch(() => setData({ icuBeds: 24, staffWorkload: 78, equipmentUsage: 65, resourceStress: "HIGH" }));
  }, [user]);

  const cards = [
    { title: "ICU Beds (Occupied)", value: `${icuData[6].occupied}/${icuData[0].total}`, icon: BedDouble, variant: "danger" as const },
    { title: "Staff Workload", value: `${data?.staffWorkload ?? 78}%`, icon: Users, variant: "warning" as const },
    { title: "Equipment Usage", value: `${data?.equipmentUsage ?? 65}%`, icon: Cpu, variant: "primary" as const },
    { title: "Resource Stress", value: data?.resourceStress ?? "HIGH", icon: TrendingUp, variant: "danger" as const },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((c, i) => <StatCard key={c.title} {...c} index={i} />)}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* ICU Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-display font-semibold mb-1">ICU Bed Usage (24h)</h3>
            <p className="text-xs text-muted-foreground mb-4">Occupied vs total capacity</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={icuData}>
                <defs>
                  <linearGradient id="icuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--border))" fill="transparent" strokeDasharray="5 5" name="Total" />
                <Area type="monotone" dataKey="occupied" stroke="hsl(0 84% 60%)" fill="url(#icuGrad)" strokeWidth={2} name="Occupied" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Staff Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-display font-semibold mb-1">Staff Workload by Department</h3>
            <p className="text-xs text-muted-foreground mb-4">On-duty vs total staff</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={staffData} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onDuty" fill="hsl(var(--primary))" name="On Duty" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
