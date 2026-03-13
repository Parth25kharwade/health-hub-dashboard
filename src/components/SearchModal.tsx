import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, Users, Brain, History, Bell,
  BedDouble, UserCheck, TrendingUp, BarChart2, FileText,
  LogOut, User, Settings, ArrowRight, Stethoscope,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onProfile: () => void;
  onSettings: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  action: () => void;
  group: string;
  keywords?: string;
}

const SearchModal = ({ open, onClose, onProfile, onSettings }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDoctor = user?.role === "ROLE_DOCTOR";

  const go = (path: string) => { navigate(path); onClose(); };

  const doctorItems: CommandItem[] = [
    { id: "dd", label: "Doctor Dashboard", description: "Overview of your patients and alerts", icon: LayoutDashboard, action: () => go("/doctor/dashboard"), group: "Pages", keywords: "home overview" },
    { id: "patients", label: "Patients", description: "Manage your patient list", icon: Users, action: () => go("/doctor/patients"), group: "Pages", keywords: "list manage" },
    { id: "ai", label: "AI Diagnosis", description: "AI-powered symptom analysis", icon: Brain, action: () => go("/doctor/ai-diagnosis"), group: "Pages", keywords: "analyze diagnose symptoms" },
    { id: "history", label: "Patient History", description: "Medical records timeline", icon: History, action: () => go("/doctor/history"), group: "Pages", keywords: "records timeline" },
    { id: "alerts", label: "Alerts", description: "Critical patient alerts", icon: Bell, action: () => go("/doctor/alerts"), group: "Pages", keywords: "critical notifications" },
  ];

  const adminItems: CommandItem[] = [
    { id: "ad", label: "Admin Dashboard", description: "Hospital overview and analytics", icon: LayoutDashboard, action: () => go("/admin/dashboard"), group: "Pages", keywords: "home overview" },
    { id: "icu", label: "ICU Management", description: "Bed occupancy and status", icon: BedDouble, action: () => go("/admin/icu"), group: "Pages", keywords: "beds occupancy" },
    { id: "staff", label: "Staff Management", description: "Manage hospital staff", icon: UserCheck, action: () => go("/admin/staff"), group: "Pages", keywords: "team workforce" },
    { id: "predict", label: "Resource Prediction", description: "AI forecast for hospital resources", icon: TrendingUp, action: () => go("/admin/prediction"), group: "Pages", keywords: "forecast ai stress" },
    { id: "forecast", label: "Forecast History", description: "Historical resource stress data", icon: BarChart2, action: () => go("/admin/forecast"), group: "Pages", keywords: "history analytics" },
  ];

  const globalItems: CommandItem[] = [
    { id: "profile", label: "My Profile", description: "View and edit your profile", icon: User, action: () => { onClose(); onProfile(); }, group: "Account", keywords: "edit info" },
    { id: "settings", label: "Settings", description: "Preferences, theme and security", icon: Settings, action: () => { onClose(); onSettings(); }, group: "Account", keywords: "theme dark light notifications" },
    { id: "logout", label: "Logout", description: "Sign out of your account", icon: LogOut, action: () => { logout(); onClose(); }, group: "Account", keywords: "sign out" },
  ];

  const allItems = [...(isDoctor ? doctorItems : adminItems), ...globalItems];

  const filtered = query.trim()
    ? allItems.filter(item =>
        `${item.label} ${item.description ?? ""} ${item.keywords ?? ""}`.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  // Group results
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(groups).flat();

  useEffect(() => { setSelectedIdx(0); }, [query]);
  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 80); setQuery(""); } }, [open]);

  // Global keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) onClose(); // parent will toggle — handled outside
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, flatFiltered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && flatFiltered[selectedIdx]) { flatFiltered[selectedIdx].action(); }
    if (e.key === "Escape") onClose();
  };

  let globalIdx = 0;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden border border-border shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, patients, actions…"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted">
              Clear
            </button>
          )}
          <kbd className="hidden sm:block text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto py-2">
          {flatFiltered.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Search className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No results for "<span className="font-medium text-foreground">{query}</span>"</p>
            </div>
          )}

          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-1">
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{group}</p>
              {items.map(item => {
                const idx = globalIdx++;
                const isSelected = idx === selectedIdx;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12, delay: idx * 0.02 }}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted/60"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "gradient-primary" : "bg-muted"
                    }`}>
                      <item.icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-none ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
                      )}
                    </div>
                    {isSelected && <ArrowRight className="w-4 h-4 text-primary shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="bg-muted px-1 rounded border border-border">↑</kbd><kbd className="bg-muted px-1 rounded border border-border">↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-muted px-1.5 rounded border border-border">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="bg-muted px-1 rounded border border-border">ESC</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
