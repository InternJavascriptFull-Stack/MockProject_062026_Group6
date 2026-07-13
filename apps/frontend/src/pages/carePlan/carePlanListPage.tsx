import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { CarePlanFilters } from "./components/carePlanFilters";
import { CarePlanSummaryCards } from "./components/carePlanSummaryCards";
import { CarePlanTable } from "./components/carePlanTable";
import { carePlanRepository } from "./services/carePlanRepository";
import type { CarePlan, CarePlanListQuery, CarePlanStatus } from "./types";

export function CarePlanListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CarePlanStatus | "all">("all");
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [summary, setSummary] = useState({
    total: 0,
    draftCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    reviewDueCount: 0,
  });

  const query = useMemo<CarePlanListQuery>(
    () => ({
      search,
      status,
      page,
      pageSize: 5
    }),
    [search, status, page],
  );

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    carePlanRepository
      .listCarePlans(query)
      .then((result) => {
        if (!isActive) return;
        setCarePlans(result.items);
        setTotal(result.total);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });
      
    // Fetch dashboard summary
    carePlanRepository.getSummary().then(data => {
      if (isActive) setSummary(data);
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
          {total} plans across your assigned residents
        </p>
      </div>

      <CarePlanFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(val) => {
          setStatus(val as CarePlanStatus | "all");
          setPage(1); // Reset to page 1 on filter
        }}
      />

      <CarePlanSummaryCards 
        total={summary.total} 
        draftCount={summary.draftCount}
        pendingCount={summary.pendingCount}
        rejectedCount={summary.rejectedCount}
        reviewDueCount={summary.reviewDueCount}
      />

      <CarePlanTable carePlans={carePlans} isLoading={isLoading} page={page} total={total} onPageChange={setPage} />
    </div>
  );
}
