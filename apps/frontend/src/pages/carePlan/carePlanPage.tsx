import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { ActivityTimeline } from "./components/activityTimeline";
import { CareAreaViewCard } from "./components/careAreaViewCard";
import { CostEstimateCard } from "./components/carePlanSidePanels";
import { ReviewCycleCard } from "./components/reviewCycleCard";

export function CarePlanPage() {
  const careAreas = [
    {
      title: "Mobility",
      badge: { text: "On Track", variant: "green" as const },
      goal: "Ambulate 50 ft with walker x2/day.",
      tasks: ["Assist ambulation w/ walker, 2x daily."],
    },
    {
      title: "Skin Integrity",
      badge: { text: "At Risk", variant: "yellow" as const },
      goal: "Maintain skin integrity (no stage-2 injury).",
      tasks: ["Reposition q2h; skin check each shift."],
    },
    {
      title: "Nutrition",
      badge: { text: "On Track", variant: "green" as const },
      goal: "Maintain fluid intake ≥ 1500 mL/day.",
      tasks: ["Monitor fluid intake; document I/O."],
    },
  ];

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
              <span>Detail</span>
              <span>&gt;</span>
              <span>Robert Hayes</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">
                Care Plan — Robert Hayes
              </h1>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Active
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Room 204B · LOC Tier 3 · Next review 2026-07-07
            </p>
          </div>

          <div className="mb-8 border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-blue-600 px-1 py-4 text-sm font-bold text-blue-600">
                Overview
              </button>
              <button className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700">
                Activity
              </button>
              <button className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700">
                Cost
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0">
              <div className="mb-4 text-sm font-bold text-slate-700">Care Areas</div>

              {careAreas.map((area, idx) => (
                <CareAreaViewCard key={idx} {...area} />
              ))}

              <ActivityTimeline />
            </div>

            <div className="min-w-0 space-y-6">
              <CostEstimateCard />
              <ReviewCycleCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
