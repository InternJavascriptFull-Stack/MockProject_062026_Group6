import { Link, useParams } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { ActivityTimeline } from "./components/activityTimeline";
import { CareAreaViewCard } from "./components/careAreaViewCard";
import { CostEstimateCard } from "./components/carePlanSidePanels";
import { ReviewCycleCard } from "./components/reviewCycleCard";
import { AssignedTasksTable } from "./components/assignedTasksTable";
import { useCarePlan } from "./services/apiHooks";

export function CarePlanPage() {
  const { id } = useParams<{ id: string }>();

  // Use React Query instead of manual fetch + useEffect
  const { data: carePlan, isLoading, isError } = useCarePlan(id);

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (isError || !carePlan) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load care plan. Please try again.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const residentName = carePlan.resident
    ? `${carePlan.resident.firstName} ${carePlan.resident.lastName}`
    : "Unknown Resident";

  // Map backend goals to UI care areas
  const mappedCareAreas = carePlan.goals?.map((g: any, index: number) => {
    let parsed: any = {};
    try {
      parsed = JSON.parse(g.description);
      if (!parsed.goal) throw new Error("not json");
    } catch {
      parsed = { goal: g.description, title: `Care Area ${index + 1}` };
    }
    return {
      title: parsed.title || `Care Area ${index + 1}`,
      badge: { text: "Active", variant: "green" as const },
      goal: parsed.goal,
      measure: parsed.measure,
      target: parsed.target,
    };
  }) || [];

  const tasks = carePlan.interventions?.map((i: any) => ({
    task: i.description,
    freq: "Daily",
    owner: i.assignedRole || "CNA",
  })) || [];

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
              <span>{residentName}</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">
                Care Plan — {residentName}
              </h1>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 uppercase">
                {carePlan.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Room 204B · LOC Tier 3 · Created on {new Date(carePlan.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="mb-8 border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button type="button" className="border-b-2 border-blue-600 px-1 py-4 text-sm font-bold text-blue-600">
                Overview
              </button>
              <button type="button" className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700">
                Activity
              </button>
              <button type="button" className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700">
                Cost
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0">
              <div className="mb-4 text-sm font-bold text-slate-700">Care Areas</div>

              {mappedCareAreas.length > 0
                ? mappedCareAreas.map((area: any, idx: number) => (
                    <CareAreaViewCard key={idx} {...area} />
                  ))
                : <div className="text-sm text-slate-500 italic mb-4">No care areas defined.</div>}

              <ActivityTimeline tasks={tasks} />
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
