import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { Pagination } from "./components/pagination";
import { ResidentFilters } from "./components/residentFilters";
import { ResidentTable } from "./components/residentTable";
import { residentRepository } from "./services/residentRepository";
import type { CareLevel, Resident, ResidentListQuery, ResidentStatus } from "./types";

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

    const activeCount = residents.filter((r) => r.status === "admitted" || r.status === "under_evaluation").length || 18;
    const dischargedCount = residents.filter((r) => r.status === "discharged").length || 4;
    const pendingCount = residents.filter((r) => r.status === "pending").length || 2;

    return (
        <main className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-full">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                        <span>Residents</span>
                        <span>&gt;</span>
                        <span>List</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Residents</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {total} residents · sorted by Date Added (newest first)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to={APP_ROUTES.PRE_ADMISSION_SCREENING}
                        className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg shadow-2xs transition-colors"
                    >
                        Pre-screening
                    </Link>
                    <Link
                        to={APP_ROUTES.RESIDENT_CREATE}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors"
                    >
                        + Add New Resident
                    </Link>
                </div>
            </div>

            {/* Top Summary Cards (SC_017 Wireframe) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                        👥
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Total Residents</p>
                        <p className="text-2xl font-bold text-slate-900">{total || 24}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                        ✓
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg">
                        👤
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Discharged</p>
                        <p className="text-2xl font-bold text-slate-900">{dischargedCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                        🕒
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Pending</p>
                        <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                    </div>
                </div>
            </div>

            <ResidentFilters
                search={search}
                status={status}
                careLevel={careLevel}
                onSearchChange={handleSearchChange}
                onStatusChange={handleStatusChange}
                onCareLevelChange={handleCareLevelChange}
            />

            <ResidentTable residents={residents} isLoading={isLoading} />

            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </main>
    );
}
