import { Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../../constants/appRoutes";

type CarePlanFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function CarePlanFilters({ search, onSearchChange }: CarePlanFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6 w-full">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search residents..."
          className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative">
          <select className="h-10 appearance-none rounded-md border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option>Status: All</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select className="h-10 appearance-none rounded-md border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option>Review: All</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        <button className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Board
        </button>

        <Link
          to={APP_ROUTES.CREATE_CARE_PLAN}
          className="flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold !text-white hover:bg-blue-700"
        >
          + New Care Plan
        </Link>
      </div>
    </div>
  );
}
