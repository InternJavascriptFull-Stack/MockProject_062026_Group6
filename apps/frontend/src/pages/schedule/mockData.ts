import type { DoctorSchedule } from "./types";
import dayjs from "dayjs";

export const getMockSchedules = (year: number, month: number): Record<number, DoctorSchedule[]> => {
  return {
    1: [
      { id: "01", doctorId: "d4", doctorName: "Dr. Petra Winsburry", time: "09:00 AM", colorVariant: "blue" },
      { id: "02", doctorId: "d5", doctorName: "Dr. Emily Smith", time: "10:00 AM", colorVariant: "teal" },
    ],
    3: [
      { id: "1", doctorId: "d1", doctorName: "Dr. John Davis", time: "11:00 AM", colorVariant: "teal" },
      { id: "2", doctorId: "d2", doctorName: "Dr. Linda Green", time: "01:00 PM", colorVariant: "blue" },
    ],
    4: [
      { id: "3", doctorId: "d3", doctorName: "Dr. Michael Brown", time: "02:00 PM", colorVariant: "blue" },
      { id: "4", doctorId: "d4", doctorName: "Dr. Petra Winsburry", time: "03:00 PM", colorVariant: "teal" },
    ],
    5: [
      { id: "5", doctorId: "d5", doctorName: "Dr. Emily Smith", time: "04:00 PM", description: "Chronic Disease Management for Hypertension with Patricia Clark", colorVariant: "teal" },
    ],
    6: [
      { id: "6", doctorId: "d4", doctorName: "Dr. Petra Winsburry", time: "10:00 AM", description: "Acute Illness Treatment for Flu Symptoms with Robert Brown", colorVariant: "blue" },
    ],
    7: [
      { id: "71", doctorId: "d1", doctorName: "Dr. John Davis", time: "09:00 AM", colorVariant: "teal" },
      { id: "72", doctorId: "d2", doctorName: "Dr. Linda Green", time: "10:00 AM", colorVariant: "blue" },
    ],
    9: [
      { id: "91", doctorId: "d3", doctorName: "Dr. Michael Brown", time: "11:00 AM", colorVariant: "blue" },
      { id: "92", doctorId: "d4", doctorName: "Dr. Petra Winsburry", time: "01:00 PM", colorVariant: "teal" },
    ],
    11: [
      { id: "101", doctorId: "d5", doctorName: "Dr. Emily Smith", time: "02:00 PM", description: "Chronic Disease Management for Asthma with Rachel Green", colorVariant: "teal" },
    ],
    12: [
      { id: "111", doctorId: "d1", doctorName: "Dr. John Davis", time: "03:00 PM", description: "Acute Illness Treatment for Skin Rash with Daniel Lewis", colorVariant: "teal" },
    ],
    14: [
      { id: "131", doctorId: "d2", doctorName: "Dr. Linda Green", time: "04:00 PM", description: "Preventive Care Consultation with Nancy Martinez", colorVariant: "teal" },
    ],
    15: [
      { id: "151", doctorId: "d4", doctorName: "Dr. Petra Winsburry", time: "09:00 AM", description: "Routine Check-Up with John Smith", colorVariant: "blue" },
    ],
    17: [
      { id: "171", doctorId: "d5", doctorName: "Dr. Emily Smith", time: "10:00 AM", description: "Chronic Disease Management for Diabetes Check-Up with Sarah Johnson", colorVariant: "teal" },
    ],
    18: [
      { id: "181", doctorId: "d1", doctorName: "Dr. John Davis", time: "11:00 AM", description: "Acute Illness Treatment for Flu Symptoms with James Brown", colorVariant: "blue" },
    ],
    20: [
      { id: "201", doctorId: "d2", doctorName: "Dr. Linda Green", time: "01:00 PM", description: "Preventive Care Consultation with Susan Clark", colorVariant: "teal" },
    ],
    22: [
      { id: "221", doctorId: "d3", doctorName: "Dr. Michael Brown", time: "02:00 PM", description: "Geriatric Care for Arthritis Management with Robert Wilson", colorVariant: "blue" },
    ],
    23: [
      { id: "231", doctorId: "d4", doctorName: "Dr. Petra Winsburry", time: "03:00 PM", description: "Routine Check-Up with Emily Thompson", colorVariant: "blue" },
    ],
    26: [
      { id: "251", doctorId: "d5", doctorName: "Dr. Emily Smith", time: "04:00 PM", description: "Chronic Disease Management for Hypertension with Jessica Green", colorVariant: "teal" },
    ],
    27: [
      { id: "261", doctorId: "d1", doctorName: "Dr. John Davis", time: "09:00 AM", description: "Acute Illness Treatment for Respiratory Infection with Michael White", colorVariant: "blue" },
    ],
    28: [
      { id: "271", doctorId: "d2", doctorName: "Dr. Linda Green", time: "10:00 AM", description: "Preventive Care Consultation with Jennifer Harris", colorVariant: "teal" },
    ],
    29: [
      { id: "281", doctorId: "d3", doctorName: "Dr. Michael Brown", time: "11:00 AM", description: "Geriatric Care for Medication Review with Barbara Lewis", colorVariant: "blue" },
    ],
    31: [
      { id: "301", doctorId: "d4", doctorName: "Dr. Petra Winsburry", time: "01:00 PM", description: "Routine Check-Up with David Thompson", colorVariant: "teal" },
    ],
  };
};
