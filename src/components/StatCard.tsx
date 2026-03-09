import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string; value: string | number; subtitle?: string;
  icon: LucideIcon; variant?: "primary" | "success" | "warning" | "danger" | "default";
  index?: number;
}

const variantStyles: Record<string, { icon: string; badge: string }> = {
  primary: { icon: "gradient-primary text-white shadow-primary", badge: "bg-primary/10 text-primary" },
  success: { icon: "gradient-success text-white", badge: "bg-success/10 text-success" },
  warning: { icon: "gradient-warning text-white", badge: "bg-warning/10 text-warning" },
  danger: { icon: "gradient-danger text-white", badge: "bg-critical/10 text-critical" },
  default: { icon: "bg-muted text-foreground", badge: "bg-muted text-muted-foreground" },
};

const StatCard = ({ title, value, subtitle, icon: Icon, variant = "default", index = 0 }: StatCardProps) => {
  const styles = variantStyles[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold mt-1 text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
