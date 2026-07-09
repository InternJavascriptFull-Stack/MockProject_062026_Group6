export type DoctorSchedule = {
  id: string;
  doctorId: string;
  doctorName: string;
  time: string; // e.g. "11:00 AM"
  description?: string; // e.g. "Chronic Disease Management..."
  colorVariant: "teal" | "blue";
};

export interface DaySchedule {
  date: Date;
  isCurrentMonth: boolean;
  schedules: DoctorSchedule[];
}

export type ViewMode = "Day" | "Week" | "Month";
