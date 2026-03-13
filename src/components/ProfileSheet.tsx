import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Building2, Shield, Edit3, Save, X, CheckCircle2,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ProfileSheet = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: "",
    department: "",
  });

  const initials = (user?.fullName ?? "MC").slice(0, 2).toUpperCase();

  const roleLabel = user?.role === "ROLE_DOCTOR" ? "Doctor" : user?.role === "ROLE_ADMIN" ? "Administrator" : user?.role ?? "";
  const roleBadgeClass = user?.role === "ROLE_DOCTOR"
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-warning/10 text-warning border-warning/20";

  const handleSave = () => {
    // In a real app, call API to update profile
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setForm({ fullName: user?.fullName ?? "", email: user?.email ?? "", phone: "", department: "" });
    setEditing(false);
  };

  const fields = [
    { icon: User, label: "Full Name", key: "fullName" as const, placeholder: "Your full name" },
    { icon: Mail, label: "Email Address", key: "email" as const, placeholder: "your@email.com" },
    { icon: Phone, label: "Phone", key: "phone" as const, placeholder: "+1-555-0101" },
    { icon: Building2, label: "Department", key: "department" as const, placeholder: "e.g. Cardiology" },
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header gradient banner */}
        <div className="gradient-primary px-6 pt-8 pb-16 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ width: 80 + i * 30, height: 80 + i * 30, right: -20 + i * 10, top: -20 + i * 5, opacity: 0.2 }} />
            ))}
          </div>
          <SheetHeader className="relative">
            <SheetTitle className="text-white text-xl font-display">My Profile</SheetTitle>
          </SheetHeader>
        </div>

        {/* Avatar overlapping the banner */}
        <div className="px-6 -mt-10 mb-4 shrink-0">
          <div className="flex items-end justify-between">
            <Avatar className="w-20 h-20 border-4 border-card shadow-xl">
              <AvatarFallback className="gradient-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!editing ? (
              <Button variant="outline" size="sm" className="gap-1.5 mb-1" onClick={() => setEditing(true)}>
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2 mb-1">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </Button>
                <Button size="sm" className="gap-1.5 gradient-primary border-0 text-white" onClick={handleSave}>
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
              </div>
            )}
          </div>

          {saved && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
              <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
            </motion.div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
          {/* Name + role */}
          <div>
            <h3 className="text-xl font-display font-bold">{user?.fullName}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className={`text-xs ${roleBadgeClass}`}>
                <Shield className="w-3 h-3 mr-1" />{roleLabel}
              </Badge>
              <span className="text-xs text-muted-foreground">Hospital #{user?.hospitalId}</span>
            </div>
          </div>

          <Separator />

          {/* Info fields */}
          <div className="space-y-4">
            {fields.map(({ icon: Icon, label, key, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  <Icon className="w-3.5 h-3.5" />{label}
                </Label>
                {editing ? (
                  <Input
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="h-9"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground">
                    {form[key] || <span className="text-muted-foreground italic">Not set</span>}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Account info */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Account Info</p>
            {[
              { label: "User ID", value: `#${user?.userId}` },
              { label: "Role", value: user?.role },
              { label: "Hospital ID", value: `#${user?.hospitalId}` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
