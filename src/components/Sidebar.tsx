import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Brain, History, Bell, BedDouble,
  UserCheck, TrendingUp, BarChart2, LogOut, Activity, ChevronRight,
  Stethoscope
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const doctorNav = [
  { to: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/patients", label: "Patients", icon: Users },
  { to: "/doctor/ai-diagnosis", label: "AI Diagnosis", icon: Brain },
  { to: "/doctor/history", label: "Patient History", icon: History },
  { to: "/doctor/alerts", label: "Alerts", icon: Bell },
];

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/icu", label: "ICU Management", icon: BedDouble },
  { to: "/admin/staff", label: "Staff Management", icon: UserCheck },
  { to: "/admin/prediction", label: "Resource Prediction", icon: TrendingUp },
  { to: "/admin/forecast", label: "Forecast History", icon: BarChart2 },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = user?.role === "ROLE_DOCTOR" ? doctorNav : adminNav;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-sidebar overflow-hidden shrink-0"
      style={{ borderRight: "1px solid hsl(var(--sidebar-border))" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0" style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <p className="font-display font-bold text-white text-base leading-none">MedCare</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "hsl(var(--sidebar-primary))" }}>AI Intelligence</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 px-3 py-2 rounded-lg" style={{ background: "hsl(var(--sidebar-accent))" }}>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--sidebar-primary))" }} />
            <div>
              <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">{user?.fullName}</p>
              <p className="text-xs" style={{ color: "hsl(var(--sidebar-primary))" }}>{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && active && <ChevronRight className="w-4 h-4 ml-auto text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 space-y-1 shrink-0" style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-red-900/30 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center border shadow-card z-10"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <ChevronRight className={cn("w-3 h-3 transition-transform text-foreground", collapsed ? "" : "rotate-180")} />
      </button>
    </motion.aside>
  );
};

export default Sidebar;
