import { RESIDENT_STATUS_LABEL } from "../constants";
import type { ResidentStatus } from "../types";

type ResidentStatusBadgeProps = {
  status: ResidentStatus;
};

export function ResidentStatusBadge({ status }: ResidentStatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {RESIDENT_STATUS_LABEL[status]}
    </span>
  );
}
