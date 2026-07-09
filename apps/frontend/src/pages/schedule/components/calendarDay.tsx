import React, { useMemo } from "react";
import dayjs from "dayjs";
import { ScheduleBlock } from "./scheduleBlock";
import { getMockSchedules } from "../mockData";

interface CalendarDayProps {
  currentMonth: Date;
}

export const CalendarDay = ({ currentMonth }: CalendarDayProps) => {
  const dayData = useMemo(() => {
    const mockData = getMockSchedules(currentMonth.getFullYear(), currentMonth.getMonth());
    // For demonstration, let's pick the 3rd which has some schedules
    return {
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 3),
      schedules: mockData[3] || [],
    };
  }, [currentMonth]);

  const dateName = dayjs(dayData.date).format("dddd, MMMM D, YYYY");

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white overflow-hidden p-6">
      <div className="border-b border-slate-200 pb-4 mb-4">

        <p className="text-sm text-slate-500 mt-1">
          {dayData.schedules.length} schedule{dayData.schedules.length !== 1 ? "s" : ""} today
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
        {dayData.schedules.length > 0 ? (
          dayData.schedules.map((schedule) => (
            <div key={schedule.id} className="max-w-xl">
              <ScheduleBlock schedule={schedule} />
            </div>
          ))
        ) : (
          <div className="text-slate-500 text-sm mt-4">No schedules for this day.</div>
        )}
      </div>
    </div>
  );
};
