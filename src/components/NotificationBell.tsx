import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle, X, Check, BellOff } from "lucide-react";

interface Notification {
  id: number;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  { id: 1, type: "critical", title: "Critical Alert", body: "Alice Johnson — Blood pressure: 185/115 mmHg. Immediate attention required.", time: "2 min ago", read: false },
  { id: 2, type: "critical", title: "Low O₂ Saturation", body: "Bob Smith — Oxygen saturation dropped to 87%. ICU team notified.", time: "8 min ago", read: false },
  { id: 3, type: "warning", title: "High Blood Sugar", body: "Carol White — Blood glucose at 290 mg/dL. Insulin adjustment needed.", time: "22 min ago", read: false },
  { id: 4, type: "info", title: "New Patient Assigned", body: "David Brown has been assigned to your care. Review intake notes.", time: "1 hr ago", read: true },
  { id: 5, type: "success", title: "Lab Report Ready", body: "Eve Davis — Complete blood panel results are now available.", time: "2 hrs ago", read: true },
  { id: 6, type: "warning", title: "ICU Capacity Warning", body: "ICU occupancy at 91% — 2 beds remaining. Consider patient transfers.", time: "3 hrs ago", read: true },
  { id: 7, type: "info", title: "System Update", body: "MedCare platform updated to v2.4.1. New AI diagnosis features available.", time: "5 hrs ago", read: true },
];

const typeConfig = {
  critical: { icon: XCircle, iconClass: "text-critical", bg: "bg-critical/10", border: "border-critical/20", dot: "bg-critical" },
  warning:  { icon: AlertTriangle, iconClass: "text-warning",  bg: "bg-warning/10",  border: "border-warning/20",  dot: "bg-warning" },
  info:     { icon: Info,          iconClass: "text-primary",  bg: "bg-primary/10",  border: "border-primary/20",  dot: "bg-primary" },
  success:  { icon: CheckCircle2,  iconClass: "text-success",  bg: "bg-success/10",  border: "border-success/20",  dot: "bg-success" },
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const NotificationBell = ({ open, onOpenChange }: Props) => {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);

  const unread = notifs.filter(n => !n.read).length;

  const markRead = (id: number) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifs(ns => ns.filter(n => n.id !== id));
  const clearAll = () => setNotifs([]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-critical flex items-center justify-center text-[9px] font-bold text-white"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-[380px] p-0 shadow-2xl border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-sm">Notifications</h3>
            {unread > 0 && (
              <Badge className="gradient-danger text-white border-0 text-[10px] h-4 px-1.5">{unread} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={markAllRead}>
                <Check className="w-3 h-3 mr-1" /> Mark all read
              </Button>
            )}
            {notifs.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-[420px]">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <BellOff className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-sm text-muted-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground/60 mt-1">No notifications right now</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {notifs.map((notif) => {
                  const cfg = typeConfig[notif.type];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors group
                        ${!notif.read ? "bg-muted/30" : "bg-card hover:bg-muted/20"}`}
                      onClick={() => markRead(notif.id)}
                    >
                      {/* Unread dot */}
                      {!notif.read && (
                        <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      )}

                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`w-4 h-4 ${cfg.iconClass}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-xs font-semibold leading-none ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">{notif.body}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">{notif.time}</p>
                      </div>

                      {/* Dismiss button */}
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifs.length > 0 && (
          <div className="border-t border-border px-4 py-2 bg-card">
            <p className="text-[11px] text-muted-foreground text-center">
              Click a notification to mark it as read · Hover to dismiss
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
