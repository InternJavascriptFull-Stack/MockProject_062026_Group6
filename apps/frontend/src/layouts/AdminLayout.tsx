import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, HelpCircle, Home, User as UserIcon, Shield, Building2, Banknote, Clock, Box, AlertTriangle, Settings, Database, FileText, LogOut, ChevronDown } from "lucide-react";
import { authService } from "../services/auth";
import { session } from "../utils/session";
import type { User } from "../types/auth";

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(session.getUser());
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    const toggleDropdown = (name: string) => {
        setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
    };

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

    const navGroups: Array<{
        label?: string;
        items: Array<{
            name: string;
            path?: string;
            icon: any;
            subItems?: Array<{ name: string; path: string }>;
        }>;
    }> = [
        {
            items: [
                { name: "Dashboard", path: "/dashboard/admin", icon: Home },
                {
                    name: "Modules",
                    icon: Box,
                    subItems: [
                        { name: "Resident Management", path: "/residents" },
                        { name: "Resident Reception", path: "/residents/reception" },
                        { name: "Doctor Schedule", path: "/doctor-schedule" },
                        { name: "eMAR Medicine", path: "/emar" },
                        { name: "Care Plans", path: "/care-plans" },
                        { name: "Admission", path: "/admissions/new" },
                        { name: "Assessments", path: "/assessments/history" },
                        { name: "Daily Tasks", path: "/care-tasks/today" },
                        { name: "Billing", path: "/billing/cost-panel" },
                        { name: "Incident & Risk", path: "/incidents" },
                    ],
                },
            ],
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
        <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <aside className="z-20 flex h-full w-[260px] flex-shrink-0 flex-col border-r border-slate-200 bg-white">
                {/* Logo */}
                <div className="flex h-16 flex-shrink-0 items-center border-b border-transparent px-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12H21M3 6H21M3 18H21" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xl font-bold tracking-tight text-slate-900">NHMS</span>
                        </div>
                        <span className="w-32 text-[10px] leading-tight font-medium text-slate-500">Nursing Home Management System</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="no-scrollbar flex-1 overflow-y-auto py-4">
                    <div className="flex flex-col gap-6 px-4">
                        {navGroups.map((group, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                                {group.label && <h3 className="mb-1 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{group.label}</h3>}
                                {group.items.map((item) => {
                                    if (item.subItems) {
                                        const isOpen = openDropdowns[item.name] || false;
                                        const hasActiveSub = item.subItems.some((sub: any) => location.pathname.startsWith(sub.path));

                                        return (
                                            <div key={item.name} className="flex flex-col">
                                                <button
                                                    onClick={() => toggleDropdown(item.name)}
                                                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                        hasActiveSub ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className={`h-4 w-4 ${hasActiveSub ? "text-blue-600" : "text-slate-400"}`} />
                                                        {item.name}
                                                    </div>
                                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                                </button>

                                                {isOpen && (
                                                    <div className="mt-1 flex flex-col gap-1 pl-10">
                                                        {item.subItems.map((sub: any) => {
                                                            const isSubActive = location.pathname.startsWith(sub.path);
                                                            return (
                                                                <Link
                                                                    key={sub.name}
                                                                    to={sub.path}
                                                                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                                                        isSubActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                                    }`}
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    const isActive = item.path ? location.pathname.startsWith(item.path) : false;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.path!}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <item.icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout at bottom */}
                <div className="flex-shrink-0 border-t border-slate-100 p-4">
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
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Header */}
                <header className="z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
                    <div>{/* Header left empty or can have page title */}</div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-slate-400">
                            <button className="transition-colors hover:text-slate-600">
                                <Bell className="h-5 w-5" />
                            </button>
                            <button className="transition-colors hover:text-slate-600">
                                <HelpCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-200"></div>

                        {user && (
                            <div className="group flex cursor-pointer items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-600 transition-colors group-hover:border-blue-100">
                                    <UserIcon className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-500">{user.roleName ?? "System Admin"}</span>
                                </div>
                                <ChevronDown className="ml-1 h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="no-scrollbar flex-1 overflow-y-auto p-8">{children}</main>
            </div>
        </div>
    );
}
