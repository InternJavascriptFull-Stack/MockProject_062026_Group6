import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DoctorSchedule } from "../types";

interface ScheduleBlockProps {
    schedule: DoctorSchedule;
}

export const ScheduleBlock = ({ schedule }: ScheduleBlockProps) => {
    const isTeal = schedule.colorVariant === "teal";

    return (
        <div className={cn("mb-1 flex flex-col rounded-md px-2 py-1.5 transition-colors hover:opacity-90", isTeal ? "bg-[#A2F2EE]" : "bg-[#DFF8F9]")}>
            <div className="mb-0.5 text-[11px] font-semibold text-[#233955]">{schedule.doctorName}</div>
            {schedule.description && <div className="mb-1 line-clamp-3 text-[10px] leading-[1.3] text-[#4B4D4F]">{schedule.description}</div>}
            <div className="mt-auto flex items-center gap-1 text-[#4B4D4F]">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium">{schedule.time}</span>
            </div>
        </div>
    );
};
