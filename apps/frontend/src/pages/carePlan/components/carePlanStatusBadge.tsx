import { Badge } from "../../../components/ui/badge";
import { CARE_PLAN_STATUS_LABEL } from "../constants";
import type { CarePlanStatus } from "../types";

export function CarePlanStatusBadge({ status }: { status: CarePlanStatus }) {
  // Map to match the visual colors in Figma
  const getBadgeStyle = (status: CarePlanStatus) => {
    switch (status) {
      case "needs_update":
      case "rejected":
        return "border-red-200 bg-red-50 text-red-700";
      case "review_due":
      case "pending_review":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "active":
      case "approved":
        return "border-green-200 bg-green-50 text-green-700";
      case "signed":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "draft":
        return "border-slate-200 bg-slate-50 text-slate-700";
      default:
        return "";
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getBadgeStyle(
        status
      )}`}
    >
      {CARE_PLAN_STATUS_LABEL[status]}
    </div>
  );
}
