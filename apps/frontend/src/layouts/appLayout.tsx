import React, { useState } from "react";
import {
  Menu,
  Home,
  Users,
  ClipboardList,
  Stethoscope,
  ShieldAlert,
  FileText,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  ChevronDown,
  User as UserIcon,
  PlusCircle,
} from "lucide-react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";
import { useAuthStore } from "../utils/session";

export function AppLayout() {
  const navigate = useNavigate();
  const { user, clear } = useAuthStore();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    clear();
    navigate("/login", { replace: true });
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Anna Lee";
  const displayRole = user?.roleName || "Nurse";
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` : "AL";

  const navigationItems = [
    { label: "Dashboard", to: APP_ROUTES.DASHBOARD, icon: Home, end: true },
    { label: "Residents", to: APP_ROUTES.RESIDENTS, icon: Users, end: false },
    { label: "Care Planning", to: APP_ROUTES.CARE_PLANS, icon: ClipboardList, end: false },
    { label: "eMAR", to: APP_ROUTES.EMAR, icon: Stethoscope, end: true, badge: "soon" },
    { label: "Incident & Risk", to: APP_ROUTES.INCIDENTS, icon: ShieldAlert, end: false },
    { label: "Reports", to: "/reports", icon: FileText, end: false },
  ];

  const isAdmin = Boolean(user?.roleName?.toLowerCase().includes("admin"));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Bar Header (BA SC_014/SC_017 Wireframe) */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>

          <Link to={APP_ROUTES.DASHBOARD} className="flex items-baseline gap-2 group">
            <span className="text-xl font-black text-slate-900 tracking-tight">NHMS</span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500">
              Nursing Home Management System
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Quick Action: Report Incident */}
          <Link
            to="/incidents/report"
            className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle size={16} />
            <span>Report Incident</span>
          </Link>

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Help */}
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Help & Support"
          >
            <HelpCircle size={18} />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">{displayName}</span>
                <span className="text-[11px] text-slate-500 font-medium leading-tight">{displayRole}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[11px] text-slate-500">{user?.email || "staff@facility.org"}</p>
                </div>

                {isAdmin && (
                  <Link
                    to="/admin/users"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={15} className="text-slate-400" />
                    <span>Admin Configuration</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "w-60" : "w-0 md:w-16"
          } bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shrink-0 overflow-hidden z-20`}
        >
          <div className="p-3 space-y-1 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] uppercase font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            {isAdmin && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors mt-4 border-t border-slate-100 pt-3 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Settings size={18} className="shrink-0" />
                <span className="truncate">Admin Console</span>
              </NavLink>
            )}
          </div>

          <div className="p-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
