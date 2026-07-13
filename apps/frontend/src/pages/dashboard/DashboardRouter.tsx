import React, { useState } from "react";
import { session } from "../../utils/session";
import { NurseDashboard } from "./NurseDashboard";
import { DonDashboard } from "./DonDashboard";
import { CnaDashboard } from "./CnaDashboard";
import type { User } from "../../types/auth";

export default function DashboardRouter() {
  const [user] = useState<User | null>(session.getUser());

  if (!user) return null;

  const roleName = user.roleName?.toLowerCase() || "";

  if (roleName.includes("nurse") && !roleName.includes("director") && !roleName.includes("admin")) {
    return <NurseDashboard />;
  }
  if (roleName.includes("cna") || roleName.includes("assistant")) {
    return <CnaDashboard />;
  }
  
  // Default to DON / Admin
  return <DonDashboard />;
}
