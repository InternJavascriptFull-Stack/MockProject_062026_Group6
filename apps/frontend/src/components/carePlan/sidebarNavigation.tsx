import * as React from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Stethoscope,
  ShieldAlert,
  TrendingUp,
  LogOut,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  hasSoonBadge?: boolean;
}

export interface SidebarNavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

/**
 * SidebarNavigation component rendering the main application navigation menu.
 */
export function SidebarNavigation({
  activeView,
  setActiveView,
}: SidebarNavigationProps) {
  const navItems: NavigationItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Residents",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Care Planning",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      name: "eMAR",
      icon: <Stethoscope className="h-5 w-5" />,
      hasSoonBadge: true,
    },
    {
      name: "Incident & Risk",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      name: "Reports",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="border-brand-border sticky top-0 flex h-screen w-[260px] shrink-0 flex-col justify-between border-r bg-white">
      {/* Top Logo Section */}
      <div className="p-6 pb-2">
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
            NHMS
          </span>
        </div>
      </div>

      {/* Middle Navigation Menu */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
        {navItems.map((item) => {
          const isActive = activeView === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                if (!item.hasSoonBadge) {
                  setActiveView(item.name);
                }
              }}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-all ${
                isActive
                  ? "text-brand-primary-dark bg-slate-100 shadow-sm"
                  : item.hasSoonBadge
                    ? "cursor-not-allowed text-slate-400 opacity-70"
                    : "text-brand-gray-muted hover:text-brand-primary-dark hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    isActive
                      ? "text-brand-primary-dark"
                      : "text-brand-gray-muted"
                  }
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {item.hasSoonBadge && (
                <span className="bg-slate-150 scale-90 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] leading-none font-bold text-slate-500 uppercase">
                  soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="border-brand-border border-t bg-slate-50/50 p-4">
        <button
          type="button"
          onClick={() => {
            setActiveView("Logout");
            alert("Logging out...");
          }}
          className="text-brand-gray-muted hover:text-brand-primary-dark flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:bg-slate-100"
        >
          <LogOut className="text-brand-gray-muted h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
