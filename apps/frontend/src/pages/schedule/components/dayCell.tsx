import React from "react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import type { DaySchedule } from "../types";
import { ScheduleBlock } from "./scheduleBlock";

interface DayCellProps {
  day: DaySchedule;
  isToday: boolean;
}

export const DayCell = ({ day, isToday }: DayCellProps) => {
  const dateNum = dayjs(day.date).date();
  const isSunday = dayjs(day.date).day() === 0;

  return (
    <div
      className={cn(
        "flex flex-col border-b border-r border-slate-200 bg-white p-1 transition-colors hover:bg-slate-50",
        !day.isCurrentMonth && "calendar-striped-bg"
      )}
    >
      <div className="flex justify-end p-1.5">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center text-sm font-semibold",
            isToday && "rounded-lg bg-[#1E293B] text-white",
            !isToday && isSunday && "text-[#EF4444]",
            !isToday && !isSunday && day.isCurrentMonth && "text-slate-700",
            !day.isCurrentMonth && !isSunday && "text-slate-300",
            !day.isCurrentMonth && isSunday && "text-red-300"
          )}
        >
          {dateNum}
        </span>
      </div>
      <div className="flex flex-col px-1 space-y-1.5 pb-2">
        {day.schedules.map((schedule) => (
          <ScheduleBlock key={schedule.id} schedule={schedule} />
        ))}
      </div>
    </div>
  );
};
