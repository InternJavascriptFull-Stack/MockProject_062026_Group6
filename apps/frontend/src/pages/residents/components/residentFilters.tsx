import { CARE_LEVEL_LABEL, RESIDENT_STATUS_LABEL } from "../constants";
import type { CareLevel, ResidentStatus } from "../types";

type ResidentFiltersProps = {
  search: string;
  status: ResidentStatus | "all";
  careLevel: CareLevel | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ResidentStatus | "all") => void;
  onCareLevelChange: (value: CareLevel | "all") => void;
};

const residentStatuses: ResidentStatus[] = [
  "pending",
  "under_evaluation",
  "admitted",
  "discharged",
];

const careLevels: CareLevel[] = [
  "independent",
  "assisted_living",
  "memory_care",
  "skilled_nursing",
];

export function ResidentFilters({
  search,
  status,
  careLevel,
  onSearchChange,
  onStatusChange,
  onCareLevelChange,
}: ResidentFiltersProps) {
  return (
    <section className="filter-panel" aria-label="Resident filters">
      <label className="field field--search">
        <span>Search residents</span>
        <input
          value={search}
          placeholder="Search by name, ID, or room"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <label className="field">
        <span>Status</span>
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as ResidentStatus | "all")
          }
        >
          <option value="all">All statuses</option>
          {residentStatuses.map((residentStatus) => (
            <option key={residentStatus} value={residentStatus}>
              {RESIDENT_STATUS_LABEL[residentStatus]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Care level</span>
        <select
          value={careLevel}
          onChange={(event) =>
            onCareLevelChange(event.target.value as CareLevel | "all")
          }
        >
          <option value="all">All care levels</option>
          {careLevels.map((level) => (
            <option key={level} value={level}>
              {CARE_LEVEL_LABEL[level]}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
