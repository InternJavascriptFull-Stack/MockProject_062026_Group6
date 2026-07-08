import * as React from "react";
import { Menu, Bell, HelpCircle, ChevronDown, Check } from "lucide-react";
import { Button } from "../ui/button";

export interface HeaderProps {
  currentRole: "CNA" | "Nurse" | "DON";
  setCurrentRole: (role: "CNA" | "Nurse" | "DON") => void;
}

const ROLES_INFO = {
  CNA: {
    name: "Marcus Rivera",
    roleLabel: "CNA",
    avatarBg: "bg-emerald-100 text-emerald-800",
    initials: "MR",
  },
  Nurse: {
    name: "Anna Lee",
    roleLabel: "Nurse",
    avatarBg: "bg-blue-100 text-blue-800",
    initials: "AL",
  },
  DON: {
    name: "Denise Carter",
    roleLabel: "DON",
    avatarBg: "bg-purple-100 text-purple-800",
    initials: "DC",
  },
};

export function Header({ currentRole, setCurrentRole }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const activeUser = ROLES_INFO[currentRole];

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="border-brand-border sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-6">
      {/* Left side: Hamburger menu and NHMS Logo */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-brand-primary-dark cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-baseline gap-2">
          <span className="font-heading text-brand-primary-dark text-xl font-bold tracking-tight">
            NHMS
          </span>
          <span className="text-brand-gray-muted hidden text-sm font-medium sm:inline">
            Nursing Home Management System
          </span>
        </div>
      </div>

      {/* Right side: Incident button, Bell, Help, Profile Switcher */}
      <div className="flex items-center gap-4">
        {/* Report Incident Button */}
        <Button
          variant="primary"
          size="sm"
          className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={() => {
            alert("Report Incident Form Opened (Mock)");
          }}
        >
          <span className="text-lg leading-none font-bold">+</span> Report
          Incident
        </Button>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="text-brand-primary-dark relative cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button
            type="button"
            className="text-brand-gray-muted cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-100"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Interactive User Profile / Role Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-all hover:bg-slate-50 focus:outline-none"
          >
            {/* Styled Circle Avatar */}
            <div
              className={`font-heading flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm ${activeUser.avatarBg}`}
            >
              {activeUser.initials}
            </div>

            {/* User name & role label */}
            <div className="hidden text-left md:block">
              <div className="text-brand-primary-dark text-sm leading-none font-bold">
                {activeUser.name}
              </div>
              <div className="text-brand-gray-muted mt-0.5 text-xs font-semibold tracking-wider uppercase">
                {activeUser.roleLabel}
              </div>
            </div>

            <ChevronDown
              className={`text-brand-gray-muted h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="border-brand-border absolute right-0 mt-2 w-64 origin-top-right rounded-xl border bg-white p-2 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="text-brand-gray-muted px-3 py-1.5 text-xs font-bold tracking-wider uppercase">
                Switch User Role
              </div>
              <div className="mt-1 space-y-1">
                {(Object.keys(ROLES_INFO) as ("CNA" | "Nurse" | "DON")[]).map(
                  (roleKey) => {
                    const user = ROLES_INFO[roleKey];
                    const isSelected = currentRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          setCurrentRole(roleKey);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left transition-all ${
                          isSelected
                            ? "text-brand-primary-dark bg-slate-50 font-semibold"
                            : "hover:text-brand-primary-dark text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${user.avatarBg}`}
                          >
                            {user.initials}
                          </div>
                          <div>
                            <div className="text-sm font-bold">{user.name}</div>
                            <div className="text-xs font-medium text-slate-400">
                              {user.roleLabel}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
