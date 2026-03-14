import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { getStaffWorkload, getIcuStatus } from "@/services/resourceService";
import { useAuth } from "@/context/AuthContext";

// ─── Staff ────────────────────────────────────────────────────────────────────
export interface StaffRecord {
  id: number;
  hospitalId: number;
  department: string;
  totalStaff: number;
  onDutyStaff: number;
  workloadPct: number;
  stressLevel: string;
}

// ─── ICU ──────────────────────────────────────────────────────────────────────
export interface IcuRecord {
  id: number;
  hospitalId: number;
  hospitalName: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  utilizationPct: number;
  stressLevel: string;
}

// ─── Context shape ────────────────────────────────────────────────────────────
interface ResourceContextType {
  // Staff
  staffList: StaffRecord[];
  staffLoading: boolean;
  refreshStaff: () => void;
  // ICU
  icuData: IcuRecord | null;
  icuLoading: boolean;
  refreshIcu: () => void;
  // Shared tick
  lastUpdated: number;
}

const ResourceContext = createContext<ResourceContextType | null>(null);

// Short department labels for chart display
const SHORT_DEPT: Record<string, string> = {
  Cardiology:  "Cardio",
  Neurology:   "Neuro",
  Orthopedics: "Ortho",
  Pediatrics:  "Peds",
  ICU:         "ICU",
  Emergency:   "Emerg",
  Radiology:   "Radio",
};
export { SHORT_DEPT };

export const ResourceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  // Staff state
  const [staffList,    setStaffList]    = useState<StaffRecord[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffTick,    setStaffTick]    = useState(Date.now());

  // ICU state
  const [icuData,    setIcuData]    = useState<IcuRecord | null>(null);
  const [icuLoading, setIcuLoading] = useState(false);
  const [icuTick,    setIcuTick]    = useState(Date.now());

  // Shared lastUpdated (max of both ticks — used by dashboard to re-fetch summary)
  const lastUpdated = Math.max(staffTick, icuTick);

  const refreshStaff = useCallback(() => setStaffTick(Date.now()), []);
  const refreshIcu   = useCallback(() => setIcuTick(Date.now()),   []);

  // ── Staff fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.hospitalId) return;
    setStaffLoading(true);
    getStaffWorkload(user.hospitalId)
      .then(r => {
        const raw = r.data?.data ?? r.data;
        setStaffList(Array.isArray(raw) ? raw : raw ? [raw] : []);
      })
      .catch(() => { /* keep stale data */ })
      .finally(() => setStaffLoading(false));
  }, [user?.hospitalId, staffTick]);

  // ── ICU fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.hospitalId) return;
    setIcuLoading(true);
    getIcuStatus(user.hospitalId)
      .then(r => {
        const raw = r.data?.data ?? r.data;
        setIcuData(raw ?? null);
      })
      .catch(() => { /* keep stale data */ })
      .finally(() => setIcuLoading(false));
  }, [user?.hospitalId, icuTick]);

  return (
    <ResourceContext.Provider value={{
      staffList, staffLoading, refreshStaff,
      icuData,   icuLoading,   refreshIcu,
      lastUpdated,
    }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResource = () => {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error("useResource must be used inside ResourceProvider");
  return ctx;
};
