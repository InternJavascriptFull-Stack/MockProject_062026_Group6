import * as React from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Stethoscope,
  Calendar,
  Building2,
  CalendarDays,
  CreditCard,
  Package,
} from "lucide-react";
import sarahSmithAvatar from "../../assets/sarahSmith.png";

export interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  active?: boolean;
}

/**
 * SidebarNavigation component rendering the main application navigation menu.
 */
export function SidebarNavigation() {
  const navItems: NavigationItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Patients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Care Plans",
      icon: <ClipboardList className="h-5 w-5" />,
      active: true,
    },
    {
      name: "Doctors",
      icon: <Stethoscope className="h-5 w-5" />,
    },
    {
      name: "Appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Departments",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      name: "Schedule",
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      name: "Payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Inventory",
      icon: <Package className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="border-brand-border sticky top-0 flex h-screen w-[260px] shrink-0 flex-col justify-between border-r bg-white">
      {/* Top Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          {/* WellNest Icon (Shield shape) */}
          <div className="bg-brand-primary-dark text-brand-primary-light flex h-8 w-8 items-center justify-center rounded-lg">
            <svg
              className="h-5 w-5 stroke-[2.5]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                stroke="currentColor"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V16M8 12H16"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-heading text-brand-primary-dark text-xl font-bold tracking-tight">
            WellNest
          </span>
        </div>
      </div>

      {/* Middle Navigation Menu */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            type="button"
            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-all ${
              item.active
                ? "bg-brand-primary-light text-brand-primary-dark shadow-sm"
                : "text-brand-gray-muted hover:text-brand-primary-dark hover:bg-slate-50"
            }`}
          >
            <span
              className={
                item.active
                  ? "text-brand-primary-dark"
                  : "text-brand-gray-muted"
              }
            >
              {item.icon}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Profile Section */}
      <div className="border-brand-border border-t bg-slate-50/50 p-4">
        <div className="flex items-center gap-3">
          <img
            src={sarahSmithAvatar}
            alt="Dr. Sarah Smith"
            className="border-brand-border h-10 w-10 rounded-full border object-cover shadow-sm"
          />
          <div className="text-left">
            <div className="text-brand-primary-dark text-sm leading-tight font-bold">
              Dr. Sarah Smith
            </div>
            <div className="text-brand-gray-muted mt-0.5 text-xs font-medium">
              Admin Staff
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
