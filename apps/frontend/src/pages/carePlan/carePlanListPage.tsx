import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { CarePlanFilters } from "./components/carePlanFilters";
import { CarePlanSummaryCards } from "./components/carePlanSummaryCards";
import { CarePlanTable } from "./components/carePlanTable";
import { carePlanRepository } from "./services/carePlanRepository";
import type { CarePlan, CarePlanListQuery } from "./types";

export function CarePlanListPage() {
  const [search, setSearch] = useState("");
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const query = useMemo<CarePlanListQuery>(
    () => ({
      search,
    }),
    [search],
  );

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    carePlanRepository
      .listCarePlans(query)
      .then((result) => {
        if (!isActive) return;
        setCarePlans(result.items);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <span>Care Planning</span>
          <span>&gt;</span>
          <span>List</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Care Plans</h1>
        <p className="mt-1 text-sm text-slate-500">
          24 plans across your assigned residents
        </p>
      </div>

      <CarePlanFilters
        search={search}
        onSearchChange={setSearch}
      />

      <CarePlanSummaryCards />

      <CarePlanTable carePlans={carePlans} isLoading={isLoading} />
    </div>
  );
}
