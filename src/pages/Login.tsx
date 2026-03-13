import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data: res } = await login(form);
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
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: Math.random() * 200 + 40, height: Math.random() * 200 + 40,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.3 }} />
          ))}
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-xl">MedCare</p>
            <p className="text-white/70 text-sm">AI Healthcare Intelligence</p>
          </div>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-display font-bold text-white leading-tight">
            Smarter healthcare<br />decisions start here.
          </h1>
          <p className="text-white/80 text-lg">
            AI-powered diagnosis analysis, real-time ICU monitoring, and intelligent resource forecasting — all in one platform.
          </p>
          <div className="flex gap-4">
            {["AI Diagnostics", "ICU Monitoring", "Staff Analytics"].map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur">{tag}</span>
            ))}
          </div>
        </div>
        <p className="relative text-white/50 text-sm">© 2025 MedCare. Empowering healthcare.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">MedCare</span>
          </div>

          <h2 className="text-2xl font-display font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 text-critical text-sm border border-critical/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="john@hospital.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground shadow-primary hover:opacity-90" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
