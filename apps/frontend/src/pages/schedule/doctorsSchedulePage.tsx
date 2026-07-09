import React, { useState } from "react";
import dayjs from "dayjs";
import { CalendarHeader } from "./components/calendarHeader";
import { CalendarGrid } from "./components/calendarGrid";
import { CalendarWeek } from "./components/calendarWeek";
import { CalendarDay } from "./components/calendarDay";
import { AddScheduleModal } from "./components/addScheduleModal";
import type { ViewMode } from "./types";

export const DoctorsSchedulePage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2028, 6, 1));
  const [viewMode, setViewMode] = useState<ViewMode>("Month");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handlePrevMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, "month").toDate());
  };

  const handleNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, "month").toDate());
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 rounded-xl bg-white p-6 pb-2 flex flex-col min-h-0 shadow-sm border border-slate-100">
        <CalendarHeader
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddClick={() => setIsAddModalOpen(true)}
        />
        <div className="flex-1 min-h-0 pb-4">
          {viewMode === "Month" && <CalendarGrid currentMonth={currentMonth} />}
          {viewMode === "Week" && <CalendarWeek currentMonth={currentMonth} />}
          {viewMode === "Day" && <CalendarDay currentMonth={currentMonth} />}
        </div>
      </div>

      <footer className="mt-4 mb-2 flex flex-col items-center justify-between gap-4 text-xs font-medium text-slate-400 sm:flex-row px-4">
        <p>Copyright © 2026 WellNest</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms and Conditions</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-100 transition-colors text-slate-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.64l.36-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="#" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-100 transition-colors text-slate-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16"/><path d="M4 20L20 4"/></svg>
          </a>
          <a href="#" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-100 transition-colors text-slate-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="#" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-100 transition-colors text-slate-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
          </a>
          <a href="#" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-100 transition-colors text-slate-400">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        </div>
      </footer>

      <AddScheduleModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};
