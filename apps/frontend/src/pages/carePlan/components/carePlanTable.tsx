import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../../constants/appRoutes";
import type { CarePlan } from "../types";
import { CarePlanStatusBadge } from "./carePlanStatusBadge";

type CarePlanTableProps = {
  carePlans: CarePlan[];
  isLoading: boolean;
};

export function CarePlanTable({ carePlans, isLoading }: CarePlanTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
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
                <Link
                  to={`${APP_ROUTES.CARE_PLANS}/${cp.id}`}
                  className="font-bold !text-blue-600 hover:!text-blue-800"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
