import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { Pagination } from "./components/pagination";
import { ResidentFilters } from "./components/residentFilters";
import { ResidentTable } from "./components/residentTable";
import { residentRepository } from "./services/residentRepository";
import type {
  CareLevel,
  Resident,
  ResidentListQuery,
  ResidentStatus,
} from "./types";

const PAGE_SIZE = 5;

export function ResidentListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ResidentStatus | "all">("all");
  const [careLevel, setCareLevel] = useState<CareLevel | "all">("all");
  const [page, setPage] = useState(1);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const query = useMemo<ResidentListQuery>(
    () => ({
      search,
      status,
      careLevel,
      page,
      pageSize: PAGE_SIZE,
    }),
    [careLevel, page, search, status],
  );

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);

    residentRepository
      .listResidents(query)
      .then((result) => {
        if (!isActive) {
          return;
        }

        setResidents(result.items);
        setTotal(result.total);
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: ResidentStatus | "all") => {
    setStatus(value);
    setPage(1);
  };

  const handleCareLevelChange = (value: CareLevel | "all") => {
    setCareLevel(value);
    setPage(1);
  };

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">Residents</span>
          <h1>Resident List</h1>
          <p>
            Search, filter, and review residents across admission and care
            workflows.
          </p>
        </div>
        <Link className="primary-action" to={APP_ROUTES.RESIDENT_RECEPTION}>
          New Reception
        </Link>
      </section>

      <ResidentFilters
        search={search}
        status={status}
        careLevel={careLevel}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onCareLevelChange={handleCareLevelChange}
      />

      <ResidentTable residents={residents} isLoading={isLoading} />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </main>
  );
}
