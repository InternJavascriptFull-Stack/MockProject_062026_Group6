import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../../constants/appRoutes";
import type { CarePlan } from "../types";
import { CarePlanStatusBadge } from "./carePlanStatusBadge";

type CarePlanTableProps = {
  carePlans: CarePlan[];
  isLoading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function CarePlanTable({ carePlans, isLoading, page, total, onPageChange }: CarePlanTableProps) {
  const totalPages = Math.ceil(total / 5);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Resident</th>
              <th className="px-6 py-4 font-semibold text-slate-600">LOC Tier</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Last Review</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Next Review ▲</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Assigned</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {carePlans.map((cp) => (
              <tr key={cp.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900">{cp.residentName}</span>
                  <span className="text-slate-900 font-bold"> · {cp.room}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{cp.locTier}</td>
                <td className="px-6 py-4">
                  <CarePlanStatusBadge status={cp.status} />
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {cp.lastReview || "—"}
                </td>
                <td className="px-6 py-4 font-medium">
                  {cp.nextReview === "overdue" ? (
                    <span className="text-blue-600 font-bold">overdue</span>
                  ) : (
                    <span className="text-slate-500">{cp.nextReview || "—"}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">{cp.assigned}</td>
                <td className="px-6 py-4 text-right">
                  {cp.status === "pending_review" ? (
                    <Link
                      to={`${APP_ROUTES.CARE_PLANS}/${cp.id}/review`}
                      className="font-bold !text-orange-600 hover:!text-orange-800"
                    >
                      Review
                    </Link>
                  ) : (
                    <Link
                      to={`${APP_ROUTES.CARE_PLANS}/${cp.id}`}
                      className="font-bold !text-blue-600 hover:!text-blue-800"
                    >
                      View
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {carePlans.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">No care plans found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
          <span className="text-sm text-slate-500">
            Showing {(page - 1) * 5 + 1} to {Math.min(page * 5, total)} of {total} results
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
