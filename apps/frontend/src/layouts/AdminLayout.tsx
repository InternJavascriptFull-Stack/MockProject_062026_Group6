import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  HelpCircle,
  Home,
  User as UserIcon,
  Shield,
  Building2,
  Banknote,
  Clock,
  Box,
  AlertTriangle,
  Settings,
  Database,
  FileText,
  LogOut,
  ChevronDown
} from "lucide-react";
import { authService } from "../services/auth";
import { session } from "../utils/session";
import type { User } from "../types/auth";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(session.getUser());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    authService.getMe().then((res) => {
      if (res.success && res.data) {
        setUser(res.data);
      }
    });
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      session.clear();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const navGroups = [
    {
      items: [{ name: "Dashboard", path: "/dashboard/admin", icon: Home }],
    },
    {
      label: "USER & ROLE MANAGEMENT",
      items: [
        { name: "Users", path: "/admin/users", icon: UserIcon },
        { name: "Roles", path: "/admin/roles", icon: Shield },
      ],
    },
    {
      label: "FACILITY & CONFIGURATION",
      items: [
        { name: "Facility", path: "/admin/facility", icon: Building2 },
        { name: "LOC Rates", path: "/admin/loc-rates", icon: Banknote },
        { name: "Staffing", path: "/admin/staffing", icon: Clock },
        { name: "Equipment", path: "/admin/equipment", icon: Box },
        { name: "Incident Severity", path: "/admin/incident-severity", icon: AlertTriangle },
        { name: "SLA Config", path: "/admin/sla-config", icon: Settings },
      ],
    },
    {
      label: "DATA & SEEDING",
      items: [{ name: "Data", path: "/admin/data", icon: Database }],
    },
    {
      label: "AUDIT & SECURITY",
      items: [{ name: "Audit", path: "/admin/audit", icon: FileText }],
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 z-20 flex h-full w-[260px] flex-col border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-bold tracking-tight text-slate-900">NHMS</span>
            </div>
            <span className="text-[10px] leading-tight font-medium text-slate-500 w-32">
              Nursing Home Management System
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col gap-6 px-4">
            {navGroups.map((group, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                {group.label && (
                  <h3 className="mb-1 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {group.label}
                  </h3>
                )}
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${
                          isActive ? "text-blue-600" : "text-slate-400"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Logout at bottom */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col pl-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            {/* Header left empty or can have page title */}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-slate-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="hover:text-slate-600 transition-colors">
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200"></div>

            {user && (
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-600 group-hover:border-blue-100 transition-colors">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {user.roleName ?? "System Admin"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 ml-1 group-hover:text-slate-600" />
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
