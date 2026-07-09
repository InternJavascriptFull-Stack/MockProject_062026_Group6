import { ActionFooter } from "../../components/carePlan/actionFooter";
import { ActiveProblemCard } from "../../components/carePlan/activeProblemCard";
import { CareGoalCard } from "../../components/carePlan/careGoalCard";
import { CarePlanTabs } from "../../components/carePlan/carePlanTabs";
import { InterventionsTable } from "../../components/carePlan/interventionsTable";
import { PatientBanner } from "../../components/carePlan/patientBanner";
import { RecentObservationCard } from "../../components/carePlan/recentObservationCard";

export function CarePlanPage() {
  return (
    <section className="min-h-screen bg-brand-bg-app">
      <PatientBanner />
      <CarePlanTabs />

      <main className="flex-1 space-y-6 p-8">
        <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[33%_67%]">
          <div className="grid grid-cols-1 gap-6">
            <ActiveProblemCard />
            <CareGoalCard />
          </div>

          <div className="flex">
            <div className="flex flex-1 flex-col">
              <InterventionsTable />
            </div>
          </div>
        </div>

        <RecentObservationCard />
      </main>

      <ActionFooter />
    </section>
  );
}
