import type { Patient } from "../types/patient";
import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";

interface PatientRowProps {
  patient: Patient;
  index: number;
}

export function PatientRow({ patient, index }: PatientRowProps) {
  const rowBg = index % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]";

  return (
    <div className={`group grid grid-cols-[2fr_1fr_1.5fr_2fr_2fr_1.5fr_1.5fr] items-center gap-4 rounded-2xl ${rowBg} px-4 py-3 transition-colors hover:bg-gray-100`}>
      <div className="flex items-center gap-4">
        <Avatar initials={patient.avatarInitials} />
        <div>
          <div className="font-semibold text-gray-900">{patient.name}</div>
          <div className="text-xs text-gray-400">ID: {patient.id}</div>
        </div>
      </div>
      <div className="text-sm font-medium text-gray-900">{patient.age}</div>
      <div className="text-sm font-medium text-gray-900">{patient.checkIn}</div>
      <div className="text-sm font-medium text-gray-900">{patient.treatment}</div>
      <div className="text-sm font-medium text-gray-900 truncate">{patient.doctor}</div>
      <div className="text-sm font-medium text-gray-900">{patient.room}</div>
      <div>
        <StatusBadge status={patient.status} />
      </div>
    </div>
  );
}
