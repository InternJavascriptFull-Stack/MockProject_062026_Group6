import * as React from "react";
import { SidebarNavigation } from "./components/carePlan/sidebarNavigation";
import { PatientBanner } from "./components/carePlan/patientBanner";
import { CarePlanTabs } from "./components/carePlan/carePlanTabs";
import { ActiveProblemCard } from "./components/carePlan/activeProblemCard";
import { CareGoalCard } from "./components/carePlan/careGoalCard";
import { InterventionsTable } from "./components/carePlan/interventionsTable";
import { RecentObservationCard } from "./components/carePlan/recentObservationCard";
import { ActionFooter } from "./components/carePlan/actionFooter";
import { Header } from "./components/dashboard/Header";
import { CnaDashboard } from "./components/dashboard/CnaDashboard";
import { NurseDashboard } from "./components/dashboard/NurseDashboard";
import { DonDashboard } from "./components/dashboard/DonDashboard";
import { Card, CardContent } from "./components/ui/card";
import { Users, ShieldAlert, TrendingUp } from "lucide-react";
import "./App.css";

type Role = "CNA" | "Nurse" | "DON";

/**
 * Main App container layout stitching components together.
 */
function App() {
  const [activeView, setActiveView] = React.useState<string>("Dashboard");
  const [currentRole, setCurrentRole] = React.useState<Role>("CNA");

  return (
    <div className="bg-brand-bg-app flex min-h-screen font-sans">
      {/* Left Sidebar */}
      <SidebarNavigation
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col justify-between overflow-x-hidden">
        {/* Top Header */}
        <Header currentRole={currentRole} setCurrentRole={setCurrentRole} />

        {/* Dynamic Workspace Content */}
        <div className="flex-1">
          {activeView === "Dashboard" && (
            <>
              {currentRole === "CNA" && <CnaDashboard />}
              {currentRole === "Nurse" && <NurseDashboard />}
              {currentRole === "DON" && <DonDashboard />}
            </>
          )}

          {activeView === "Care Planning" && (
            <>
              {/* Header Banner & Tabs */}
              <div>
                <PatientBanner />
                <CarePlanTabs />
              </div>

              {/* Main Workspace Dashboard Content */}
              <main className="flex-1 space-y-6 p-8">
                {/* Split View Content Layout */}
                <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[33%_67%]">
                  {/* Left column: Problem and Goal cards */}
                  <div className="grid grid-cols-1 gap-6">
                    <ActiveProblemCard />
                    <CareGoalCard />
                  </div>

                  {/* Right column: Interventions and Tasks Table */}
                  <div className="flex">
                    <div className="flex flex-1 flex-col">
                      <InterventionsTable />
                    </div>
                  </div>
                </div>

                {/* Full Width Bottom Observation */}
                <RecentObservationCard />
              </main>

              {/* Sticky Action Footer */}
              <ActionFooter />
            </>
          )}

          {/* Fallback Placeholder Views */}
          {activeView !== "Dashboard" && activeView !== "Care Planning" && (
            <main className="flex-1 p-6 md:p-8">
              <div>
                <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                  Page
                </div>
                <h1 className="font-heading text-brand-primary-dark mt-0.5 text-3xl font-extrabold tracking-tight">
                  {activeView}
                </h1>
                <p className="text-brand-gray-muted mt-1 text-sm font-medium">
                  View and manage facility details
                </p>
              </div>

              <div className="mt-8">
                <Card className="max-w-2xl">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    {activeView === "Residents" && (
                      <Users className="mb-4 h-12 w-12 text-slate-300" />
                    )}
                    {activeView === "Incident & Risk" && (
                      <ShieldAlert className="mb-4 h-12 w-12 text-slate-300" />
                    )}
                    {activeView === "Reports" && (
                      <TrendingUp className="mb-4 h-12 w-12 text-slate-300" />
                    )}
                    <h3 className="font-heading text-brand-primary-dark mb-2 text-lg font-bold">
                      {activeView} Module
                    </h3>
                    <p className="mb-6 max-w-sm text-sm text-slate-400">
                      The {activeView} module details are currently being
                      loaded. Tap on "Dashboard" or "Care Planning" in the
                      sidebar to return to the interactive sections.
                    </p>
                    <button
                      onClick={() => {
                        setActiveView("Dashboard");
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
