import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { AssignedTasksTable } from "./components/assignedTasksTable";
import { CareAreaCard } from "./components/careAreaCard";
import { CostEstimateCard, PlanStatusCard } from "./components/carePlanSidePanels";
import { LocGateBanner } from "./components/locGateBanner";

export function CreateCarePlanPage() {
  const careAreas = [
    {
      title: "Mobility",
      badge: { text: "Suggested from Assessment", variant: "blue" as const },
      goal: "Resident will ambulate 50 ft with walker x2/day by 2026-07-30.",
      measure: "distance log",
      target: "2026-07-30",
      tasks: ["Assist ambulation with front-wheel walker, twice daily (AM/PM)."],
    },
    {
      title: "Skin Integrity",
      badge: { text: "Suggested from Assessment", variant: "blue" as const },
      goal: "Maintain skin integrity; no stage-2 pressure injury through review cycle.",
      measure: "Braden score",
      target: "2026-10-07",
      tasks: ["Reposition every 2 hours; document skin checks each shift."],
    },
    {
      title: "Nutrition",
      badge: { text: "Manual", variant: "gray" as const },
      goal: "Maintain adequate hydration — fluid intake ≥ 1500 mL/day.",
      measure: "I/O log",
      target: "ongoing",
      tasks: ["Encourage 1500 mL fluid intake daily; monitor I/O."],
    },
  ];

  // Toggle this to test SC_028 vs SC_027
  const isLocConfirmed = true;

  if (!isLocConfirmed) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col bg-slate-50/50">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Link to={APP_ROUTES.CARE_PLANS} className="hover:underline">
                  Care Planning
                </Link>
                <span>&gt;</span>
                <span>New Care Plan</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">New Care Plan</h1>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-slate-500">Elena Ramos · Room 106A</p>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  LOC: Suggested (Tier 1)
                </span>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-orange-700 text-xs font-bold">
                !
              </span>
              <span className="text-sm font-bold">
                Level of Care is not yet Confirmed for this resident.
              </span>
            </div>

            <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="mb-3 text-2xl font-bold text-slate-900">Care plan creation is locked</h2>
              <p className="mx-auto mb-8 max-w-md text-slate-500">
                A resident's Level of Care must be Confirmed before a care plan can be created for them (gate LC-G4).
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <button disabled className="h-10 rounded-md border border-slate-200 bg-slate-50 px-6 text-sm font-medium text-slate-400 cursor-not-allowed">
                    Create Care Plan
                  </button>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Confirm LOC classification first.
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
                <button className="h-10 rounded-md bg-blue-600 px-6 text-sm font-bold !text-white hover:bg-blue-700">
                  Go to LOC Classification →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-slate-50/50">
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Link to={APP_ROUTES.CARE_PLANS} className="hover:underline">
                Care Planning
              </Link>
              <span>&gt;</span>
              <span>New Care Plan</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">New Care Plan</h1>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                Draft
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Robert Hayes · Room 204B</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0">
              <LocGateBanner />

              <div className="mb-4 text-sm font-bold text-slate-700">
                Care Areas (Master Care Plan — §3.0)
              </div>

              {careAreas.map((area, idx) => (
                <CareAreaCard key={idx} {...area} />
              ))}

              <button className="mt-2 flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                + Add Care Area
              </button>

              <AssignedTasksTable />
            </div>

            <div className="min-w-0">
              <CostEstimateCard />
              <PlanStatusCard />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white p-4">
        <div className="mx-auto flex max-w-6xl justify-end gap-4">
          <button className="h-10 rounded-md border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Save Draft
          </button>
          <button className="h-10 rounded-md bg-blue-600 px-6 text-sm font-bold !text-white hover:bg-blue-700">
            Submit for Review
          </button>
        </div>
      </footer>
    </div>
  );
}
