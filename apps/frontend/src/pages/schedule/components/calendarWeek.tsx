import React, { useMemo } from "react";
import dayjs from "dayjs";
import { DayCell } from "./dayCell";
import type { DaySchedule } from "../types";
import { getMockSchedules } from "../mockData";

interface CalendarWeekProps {
  currentMonth: Date;
}

export const CalendarWeek = ({ currentMonth }: CalendarWeekProps) => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const weekDays = useMemo(() => {
    // The mockup's 'Today' is the 20th, so let's show the week containing the 20th
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 20);
    const startOfWeek = dayjs(targetDate).startOf("week");

    const days: DaySchedule[] = [];
    const mockData = getMockSchedules(currentMonth.getFullYear(), currentMonth.getMonth());

    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.add(i, "day");
      const isCurrentMonth = date.month() === dayjs(currentMonth).month();
      const dateNum = date.date();

      days.push({
        date: date.toDate(),
        isCurrentMonth,
        schedules: isCurrentMonth ? mockData[dateNum] || [] : [],
      });
    }

    return days;
  }, [currentMonth]);

  // The mockup highlights the 20th as "Today"
  const mockupToday = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 20);

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-h-scrollbar">
        <div className="min-w-[800px] md:min-w-0 h-full flex flex-col">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-[#F8FAFC]">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-[13px] font-medium text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-[#F8FAFC] no-scrollbar">
            <div className="grid grid-cols-7 min-h-full">
              {weekDays.map((day, index) => {
                const isToday = dayjs(day.date).isSame(mockupToday, "day");
                return <DayCell key={index} day={day} isToday={isToday} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
