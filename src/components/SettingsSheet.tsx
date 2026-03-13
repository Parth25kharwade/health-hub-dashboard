import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Bell, Moon, Sun, Monitor, Globe, Lock, ShieldCheck,
  BellRing, MailOpen, Smartphone, Palette, CheckCircle2,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Theme = "system" | "light" | "dark";

const SettingsSheet = ({ open, onClose }: Props) => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    emailDigest: false,
    pushNotifications: true,
    soundAlerts: true,
    weeklyReport: false,
  });

  const [privacy, setPrivacy] = useState({
    twoFactor: false,
    sessionTimeout: true,
    activityLog: true,
  });

  const applyTheme = (t: Theme) => {
    setTheme(t);
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else if (t === "light") root.classList.remove("dark");
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const themeOptions: { value: Theme; label: string; icon: any }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const notifItems = [
    { key: "criticalAlerts" as const, icon: BellRing, label: "Critical Alerts", desc: "Get notified for critical patient alerts immediately" },
    { key: "emailDigest" as const, icon: MailOpen, label: "Email Digest", desc: "Daily summary of activity sent to your email" },
    { key: "pushNotifications" as const, icon: Smartphone, label: "Push Notifications", desc: "Browser push notifications for real-time updates" },
    { key: "soundAlerts" as const, icon: Bell, label: "Sound Alerts", desc: "Audio cues for high-priority alerts" },
    { key: "weeklyReport" as const, icon: MailOpen, label: "Weekly Report", desc: "Weekly analytics report delivered to your email" },
  ];

  const privacyItems = [
    { key: "twoFactor" as const, icon: ShieldCheck, label: "Two-Factor Auth", desc: "Add an extra layer of security to your account" },
    { key: "sessionTimeout" as const, icon: Lock, label: "Auto Session Timeout", desc: "Automatically log out after 30 minutes of inactivity" },
    { key: "activityLog" as const, icon: Globe, label: "Activity Log", desc: "Track your login and action history" },
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0 border-b border-border">
          <SheetHeader>
            <SheetTitle className="text-xl font-display flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              Settings
            </SheetTitle>
            <p className="text-sm text-muted-foreground">Manage your preferences and account security</p>
          </SheetHeader>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {saved && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Settings saved successfully
            </motion.div>
          )}

          {/* Appearance */}
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appearance</p>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => applyTheme(value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      theme === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}>
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="fr">🇫🇷 French</SelectItem>
                  <SelectItem value="de">🇩🇪 German</SelectItem>
                  <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          {/* Notifications */}
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notifications</p>
            <div className="space-y-3">
              {notifItems.map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-4 py-1">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none">{label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[key]}
                    onCheckedChange={v => setNotifications({ ...notifications, [key]: v })}
                    className="shrink-0 mt-0.5"
                  />
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Privacy & Security */}
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Privacy & Security</p>
            <div className="space-y-3">
              {privacyItems.map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-4 py-1">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none">{label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy[key]}
                    onCheckedChange={v => setPrivacy({ ...privacy, [key]: v })}
                    className="shrink-0 mt-0.5"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="gradient-primary border-0 text-white hover:opacity-90" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
