import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { register } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    hospitalId: 1,
    role: "ROLE_DOCTOR" as "ROLE_DOCTOR" | "ROLE_ADMIN",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const { data: res } = await register({
        ...form,
        hospitalId: Number(form.hospitalId),
        phone: form.phone || undefined,
        specialization: form.specialization || undefined,
      });
      const { data } = res;
      authLogin({
        token: data.token,
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        hospitalId: data.hospitalId,
      });
      navigate(data.role === "ROLE_DOCTOR" ? "/doctor/dashboard" : "/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">MedCare</span>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <h2 className="text-2xl font-display font-bold mb-1">Create Account</h2>
          <p className="text-muted-foreground text-sm mb-6">Join the MedCare platform</p>

          {error && <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 text-critical text-sm border border-critical/20">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="Dr. John Doe" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="john@hospital.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone <span className="text-muted-foreground">(optional)</span></Label>
                <Input placeholder="+1-555-0101" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Specialization <span className="text-muted-foreground">(optional)</span></Label>
                <Input placeholder="Internal Medicine" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROLE_DOCTOR">Doctor</SelectItem>
                    <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Hospital ID</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={form.hospitalId}
                  onChange={e => setForm({ ...form, hospitalId: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90 mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
