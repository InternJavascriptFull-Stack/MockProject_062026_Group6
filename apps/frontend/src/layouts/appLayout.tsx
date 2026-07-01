import {
    Bell,
    Calendar,
    ChevronDown,
    ClipboardList,
    CreditCard,
    FileWarning,
    HeartPulse,
    Home,
    LayoutDashboard,
    Menu,
    MessageCircleHeart,
    Search,
    Settings,
    Stethoscope,
    Users,
    Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";

interface NavigationItem {
    label: string;
    to: string;
    icon: LucideIcon;
    end?: boolean;
}

const navigationItems: NavigationItem[] = [
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
        label: "Intake Assessment",
        to: APP_ROUTES.INTAKE_ASSESSMENT,
        icon: ClipboardList,
        end: true,
    },
    {
        label: "Care Plan",
        to: APP_ROUTES.CARE_PLAN,
        icon: MessageCircleHeart,
        end: true,
    },
    {
        label: "Medication",
        to: APP_ROUTES.MEDICATION,
        icon: Stethoscope,
        end: true,
    },
    {
        label: "Staff Schedule",
        to: APP_ROUTES.STAFF_SCHEDULE,
        icon: Calendar,
        end: true,
    },
    {
        label: "Meal & Diet",
        to: APP_ROUTES.MEAL_DIET,
        icon: Utensils,
        end: true,
    },
    {
        label: "Billing",
        to: APP_ROUTES.BILLING,
        icon: CreditCard,
        end: true,
    },
    {
        label: "Incident Report",
        to: APP_ROUTES.INCIDENT_REPORT,
        icon: FileWarning,
        end: true,
    },
    {
        label: "Family Portal",
        to: APP_ROUTES.FAMILY_PORTAL,
        icon: Home,
        end: true,
    },
];

export function AppLayout() {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className="bg-brand-bg-app text-brand-primary-dark min-h-screen md:grid md:grid-cols-[76px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)]">
            <aside className="border-brand-border sticky top-0 z-30 border-b bg-white/95 shadow-sm backdrop-blur md:h-screen md:border-r md:border-b-0 md:shadow-none xl:flex xl:flex-col">
                <div className="flex h-16 items-center justify-between gap-3 px-4 md:h-auto md:justify-center md:px-3 md:py-5 xl:justify-start xl:px-6 xl:py-6">
                    <NavLink to={APP_ROUTES.DASHBOARD} className="flex min-w-0 items-center gap-3" aria-label="WellNest dashboard">
                        <span className="bg-brand-primary-light text-brand-primary-dark grid h-10 w-10 shrink-0 place-items-center rounded-lg">
                            <HeartPulse size={22} />
                        </span>
                        <span className="min-w-0 md:hidden xl:block">
                            <strong className="font-heading block truncate text-xl leading-6 font-bold">WellNest</strong>
                            <span className="text-brand-gray-muted block truncate text-xs font-semibold">Nursing Home</span>
                        </span>
                    </NavLink>

                    <button
                        type="button"
                        className="border-brand-border grid h-9 w-9 place-items-center rounded-lg border bg-white text-slate-500 transition-colors hover:bg-slate-50 md:hidden"
                        aria-label="Toggle navigation"
                        aria-expanded={isMobileNavOpen}
                        onClick={() => setIsMobileNavOpen((isOpen) => !isOpen)}
                    >
                        <Menu size={18} />
                    </button>
                </div>

                <nav
                    className={`${isMobileNavOpen ? "flex" : "hidden"} border-brand-border gap-2 overflow-x-auto border-t px-3 py-2 md:grid md:content-start md:gap-2 md:overflow-visible md:border-t-0 md:px-3 md:py-2 xl:flex-1 xl:px-4`}
                    aria-label="Main navigation"
                >
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                title={item.label}
                                onClick={() => setIsMobileNavOpen(false)}
                                className={({ isActive }) =>
                                    [
                                        "group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors md:h-11 md:w-11 md:px-0 xl:w-full xl:justify-start xl:gap-3 xl:px-3",
                                        isActive ? "bg-brand-primary-light text-brand-primary-dark" : "hover:text-brand-primary-dark text-slate-500 hover:bg-teal-50",
                                    ].join(" ")
                                }
                            >
                                <Icon className="h-[18px] w-[18px] shrink-0" />
                                <span className="max-w-[150px] truncate md:sr-only xl:not-sr-only">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="bg-brand-primary-dark mx-4 mb-5 hidden rounded-lg p-4 text-white xl:block">
                    <span className="text-xs font-semibold text-teal-100">Care operations</span>
                    <p className="mt-2 text-sm leading-5 text-white/85">Manage residents, schedules, medication, billing, and family updates in one workspace.</p>
                </div>
            </aside>

            <div className="flex min-w-0 flex-col">
                <header className="border-brand-border z-20 border-b bg-white/90 px-4 py-3 backdrop-blur-md md:sticky md:top-0 md:px-5 lg:px-6 xl:px-8">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center justify-between gap-3 lg:block">
                            <div className="min-w-0">
                                <p className="hidden text-xs font-bold tracking-[0.14em] text-teal-700 uppercase sm:block">Nursing Home Management</p>
                                <h1 className="font-heading text-brand-primary-dark truncate text-lg font-bold sm:text-xl xl:text-2xl">Main Workspace</h1>
                            </div>
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 sm:hidden">Live</span>
                        </div>

                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                            <label className="relative min-w-0 sm:w-64 xl:w-80">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="search"
                                    placeholder="Search anything"
                                    className="border-brand-border h-10 w-full rounded-lg border bg-slate-50 pr-3 pl-9 text-sm font-medium text-slate-700 transition outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                                />
                            </label>

                            <div className="flex items-center justify-between gap-2 sm:justify-start">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="border-brand-border grid h-10 w-10 place-items-center rounded-lg border bg-white text-slate-500 transition-colors hover:bg-slate-50"
                                        aria-label="Settings"
                                    >
                                        <Settings size={17} />
                                    </button>
                                    <button
                                        type="button"
                                        className="border-brand-border relative grid h-10 w-10 place-items-center rounded-lg border bg-white text-slate-500 transition-colors hover:bg-slate-50"
                                        aria-label="Notifications"
                                    >
                                        <Bell size={17} />
                                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="border-brand-border flex h-10 min-w-0 items-center gap-2 rounded-lg border bg-white px-2.5 text-left transition-colors hover:bg-slate-50"
                                >
                                    <span className="bg-brand-primary-light text-brand-primary-dark grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold">SW</span>
                                    <span className="hidden min-w-0 sm:block">
                                        <strong className="text-brand-primary-dark block truncate text-xs font-bold">Sarah Wilson</strong>
                                        <span className="text-brand-gray-muted block truncate text-[11px] font-semibold">Care Manager</span>
                                    </span>
                                    <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="min-w-0 flex-1 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
