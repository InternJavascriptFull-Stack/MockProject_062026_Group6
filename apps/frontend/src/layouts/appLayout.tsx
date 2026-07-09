import {
    Calendar,
    ClipboardList,
    HeartPulse,
    LayoutDashboard,
    LogIn,
    Stethoscope,
    UserRound,
    Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";

const navigationItems = [
  {
    label: "Dashboard",
    to: APP_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Residents",
    to: APP_ROUTES.RESIDENTS,
    icon: Users,
    end: true,
  },
  {
    label: "Reception",
    to: APP_ROUTES.RESIDENT_RECEPTION,
    icon: ClipboardList,
    end: true,
  },
  {
    label: "Doctor Schedule",
    to: APP_ROUTES.DOCTOR_SCHEDULE,
    icon: Calendar,
    end: true,
  },
  {
    label: "eMAR Medicine",
    to: APP_ROUTES.EMAR,
    icon: Stethoscope,
    end: true,
  },
  {
    label: "Care Plan",
    to: APP_ROUTES.CARE_PLAN,
    icon: ClipboardList,
    end: true,
  },
  {
    label: "Login",
    to: APP_ROUTES.LOGIN,
    icon: LogIn,
    end: true,
  },
];

export function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__icon">
            <HeartPulse size={24} />
          </div>
          <div>
            <strong>WellNest</strong>
            <span>Nursing Home</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div className="topbar-resident">
            <div className="topbar-avatar">
              ER
              <span aria-hidden="true" />
            </div>
            <div>
              <strong>Nursing Home Management</strong>
              <span>Residents, care plans, schedules, and medication records</span>
            </div>
          </div>

          <div className="alert-chips" aria-label="Resident alerts">
            <span className="alert-chip alert-chip--danger">DNR/DNI</span>
            <span className="alert-chip alert-chip--danger">
              Allergy: Penicillin
            </span>
            <span className="alert-chip alert-chip--neutral">High Fall Risk</span>
          </div>

          <div className="user-chip">
            <span>
              <UserRound size={16} />
            </span>
            <strong>Sarah Johnson</strong>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
