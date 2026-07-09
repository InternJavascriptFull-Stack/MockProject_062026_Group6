import * as React from "react";
import { SidebarNavigation } from "./components/dashboard/sidebarNavigation";
import { Header } from "./components/dashboard/Header";
import { CnaDashboard } from "./components/dashboard/CnaDashboard";
import { NurseDashboard } from "./components/dashboard/NurseDashboard";
import { DonDashboard } from "./components/dashboard/DonDashboard";
import { CarePlanDetail } from "./components/dashboard/CarePlanDetail";
import { Card, CardContent } from "./components/ui/card";
import { Users, ShieldAlert, TrendingUp, ClipboardList } from "lucide-react";
import { useRouter } from "./lib/router";
import "./App.css";

type Role = "CNA" | "Nurse" | "DON";

const getActiveItemName = (path: string): string => {
  if (path === "/" || path.startsWith("/dashboard")) return "Dashboard";
  if (path.startsWith("/care-planning")) return "Care Planning";
  if (path.startsWith("/residents")) return "Residents";
  if (path.startsWith("/incident-risk")) return "Incident & Risk";
  if (path.startsWith("/reports")) return "Reports";
  return "Dashboard";
};

/**
 * Main App container layout stitching components together.
 */
function App() {
  const { pathname, navigate, getQueryParam } = useRouter();
  const [currentRole, setCurrentRole] = React.useState<Role>("CNA");

  return (
    <div className="bg-brand-bg-app flex min-h-screen font-sans">
      {/* Left Sidebar */}
      <SidebarNavigation
        activeView={getActiveItemName(pathname)}
        setActiveView={(viewName) => {
          const pathToViewMap: Record<string, string> = {
            Dashboard: "/dashboard",
            Residents: "/residents",
            "Care Planning": "/care-planning",
            "Incident & Risk": "/incident-risk",
            Reports: "/reports",
          };
          navigate(pathToViewMap[viewName] ?? "/dashboard");
        }}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col justify-between overflow-x-hidden">
        {/* Top Header */}
        <Header currentRole={currentRole} setCurrentRole={setCurrentRole} />

        {/* Dynamic Workspace Content */}
        <div className="flex-1">
          {(pathname === "/" || pathname.startsWith("/dashboard")) && (
            <>
              {currentRole === "CNA" && <CnaDashboard />}
              {currentRole === "Nurse" && <NurseDashboard />}
              {currentRole === "DON" && <DonDashboard />}
            </>
          )}

          {pathname === "/care-planning" && (
            <main className="flex-1 p-6 md:p-8">
              <div>
                <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                  Page
                </div>
                <h1 className="font-heading text-brand-primary-dark mt-0.5 text-3xl font-extrabold tracking-tight">
                  Care Planning
                </h1>
                <p className="text-brand-gray-muted mt-1 text-sm font-medium">
                  View and manage care plans
                </p>
              </div>

              <div className="mt-8">
                <Card className="max-w-2xl">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <ClipboardList className="mb-4 h-12 w-12 text-slate-300" />
                    <h3 className="font-heading text-brand-primary-dark mb-2 text-lg font-bold">
                      Care Planning Module
                    </h3>
                    <p className="mb-6 max-w-sm text-sm text-slate-400">
                      The Care Planning module details are currently being
                      loaded. Tap on "Dashboard" in the sidebar to return to the
                      interactive sections.
                    </p>
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                      }}
                      className="bg-brand-primary-dark cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-95"
                    >
                      Back to Dashboard
                    </button>
                  </CardContent>
                </Card>
              </div>
            </main>
          )}

          {(pathname === "/care-planning/detail" ||
            pathname === "/care-planning/review") && (
            <CarePlanDetail
              residentId={getQueryParam("residentId") ?? "1"}
              navigate={navigate}
            />
          )}

          {/* Fallback Placeholder Views */}
          {pathname !== "/" &&
            !pathname.startsWith("/dashboard") &&
            pathname !== "/care-planning" &&
            pathname !== "/care-planning/detail" &&
            pathname !== "/care-planning/review" && (
              <main className="flex-1 p-6 md:p-8">
                <div>
                  <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                    Page
                  </div>
                  <h1 className="font-heading text-brand-primary-dark mt-0.5 text-3xl font-extrabold tracking-tight">
                    {getActiveItemName(pathname)}
                  </h1>
                  <p className="text-brand-gray-muted mt-1 text-sm font-medium">
                    View and manage facility details
                  </p>
                </div>

                <div className="mt-8">
                  <Card className="max-w-2xl">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                      {pathname.startsWith("/residents") && (
                        <Users className="mb-4 h-12 w-12 text-slate-300" />
                      )}
                      {pathname.startsWith("/incident-risk") && (
                        <ShieldAlert className="mb-4 h-12 w-12 text-slate-300" />
                      )}
                      {pathname.startsWith("/reports") && (
                        <TrendingUp className="mb-4 h-12 w-12 text-slate-300" />
                      )}
                      <h3 className="font-heading text-brand-primary-dark mb-2 text-lg font-bold">
                        {getActiveItemName(pathname)} Module
                      </h3>
                      <p className="mb-6 max-w-sm text-sm text-slate-400">
                        The {getActiveItemName(pathname)} module details are
                        currently being loaded. Tap on "Dashboard" or "Care
                        Planning" in the sidebar to return to the interactive
                        sections.
                      </p>
                      <button
                        onClick={() => {
                          navigate("/dashboard");
                        }}
                        className="bg-brand-primary-dark cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-95"
                      >
                        Back to Dashboard
                      </button>
                    </CardContent>
                  </Card>
                </div>
              </main>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;
