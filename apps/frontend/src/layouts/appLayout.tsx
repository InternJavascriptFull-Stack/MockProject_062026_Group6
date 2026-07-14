import { Calendar, ClipboardCheck, ClipboardList, FilePlus2, HeartPulse, LayoutDashboard, Receipt, Stethoscope, UserRound, Users, ShieldAlert } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";

const navigationItems = [
    { label: "Dashboard", to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard, end: true },
    { label: "Residents", to: APP_ROUTES.RESIDENTS, icon: Users, end: false },
    { label: "Pre-screening", to: APP_ROUTES.PRE_ADMISSION_SCREENING, icon: ClipboardList, end: true },
    { label: "Admission", to: APP_ROUTES.ADMISSION_CREATE, icon: FilePlus2, end: true },
    { label: "Assessments", to: APP_ROUTES.ASSESSMENT_HISTORY, icon: ClipboardCheck, end: false },
    { label: "Care Plans", to: APP_ROUTES.CARE_PLANS, icon: ClipboardList, end: false },
    { label: "Daily Tasks", to: APP_ROUTES.DAILY_TASKS, icon: ClipboardCheck, end: false },
    { label: "Billing", to: APP_ROUTES.BILLING_COST_PANEL, icon: Receipt, end: false },
    { label: "Incident & Risk", to: APP_ROUTES.INCIDENTS, icon: ShieldAlert, end: false },
    { label: "Doctor Schedule", to: APP_ROUTES.DOCTOR_SCHEDULE, icon: Calendar, end: true },
    { label: "eMAR Medicine", to: APP_ROUTES.EMAR, icon: Stethoscope, end: true },
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
                            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "sidebar-link sidebar-link--active" : "sidebar-link")}>
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
                        <span className="alert-chip alert-chip--danger">Allergy: Penicillin</span>
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
