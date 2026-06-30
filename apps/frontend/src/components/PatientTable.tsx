import { ChevronsUpDown } from "lucide-react";
import { PatientRow } from "./PatientRow";
import type { Patient } from "../types/patient";

interface PatientTableProps {
  patients: Patient[];
  onSort: (field: keyof Patient) => void;
}

export function PatientTable({
  patients,
  onSort,
}: PatientTableProps) {
  const headers: { label: string; field: keyof Patient | null }[] = [
    { label: "Name", field: "name" },
    { label: "Age", field: "age" },
    { label: "Check In", field: "checkIn" },
    { label: "Treatment", field: "treatment" },
    { label: "Doctor Assigned", field: "doctor" },
    { label: "Room", field: "room" },
    { label: "Status", field: "status" },
  ];

  return (
    <div className="flex flex-col gap-2">

      <div className="grid grid-cols-[2fr_1fr_1.5fr_2fr_2fr_1.5fr_1.5fr] items-center gap-4 px-4 py-2 mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
        {headers.map((header, index) => (
          <div
            key={index}
            onClick={() => header.field && onSort(header.field)}
            className="flex cursor-pointer items-center gap-1 transition hover:text-gray-600"
          >
            {header.label}
            {header.field && (
              <ChevronsUpDown className="h-3 w-3" />
            )}
          </div>
        ))}
      </div>


      <div className="flex flex-col">
        {patients.length > 0 ? (
          patients.map((patient, index) => (
            <PatientRow
              key={patient.id}
              patient={patient}
              index={index}
            />
          ))
        ) : (
          <div className="flex h-32 items-center justify-center rounded-2xl bg-soft-gray text-gray-500">
            No patients found.
          </div>
        )}
      </div>
    </div>
  );
}
