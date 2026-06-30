import type { Patient } from "../types/patient";

export const mockPatients: Patient[] = [
  { id: "301", name: "Caren G. Simpson", age: 35, checkIn: "20/07/28", treatment: "Routine Check-Up", doctor: "Dr. Petra Winsburry", room: "-", status: "Active", avatarInitials: "CG" },
  { id: "302", name: "Edgar Warrow", age: 45, checkIn: "20/07/28", treatment: "Cardiac Consultation", doctor: "Dr. Olivia Martinez", room: "-", status: "Active", avatarInitials: "EW" },
  { id: "303", name: "Ocean Jane Lupre", age: 10, checkIn: "20/07/28", treatment: "Pediatric Check-Up", doctor: "Dr. Damian Sanchez", room: "Double - 303", status: "New Patient", avatarInitials: "OJ" },
  { id: "304", name: "Shane Riddick", age: 50, checkIn: "20/07/28", treatment: "Skin Allergy", doctor: "Dr. Chloe Harrington", room: "Single - 304", status: "Inactive", avatarInitials: "SR" },
  { id: "305", name: "Queen Lawnston", age: 60, checkIn: "20/07/28", treatment: "Follow-Up Visit", doctor: "Dr. Petra Winsburry", room: "Single - 305", status: "Active", avatarInitials: "QL" },
  { id: "306", name: "Alice Mitchell", age: 28, checkIn: "20/07/28", treatment: "Routine Check-Up", doctor: "Dr. Emily Smith", room: "-", status: "Active", avatarInitials: "AM" },
  { id: "307", name: "Mikhail Morozov", age: 55, checkIn: "20/07/28", treatment: "Cardiac Consultation", doctor: "Dr. Samuel Thompson", room: "-", status: "Active", avatarInitials: "MM" },
  { id: "308", name: "Mateus Fernandes", age: 12, checkIn: "20/07/28", treatment: "Pediatric Check-Up", doctor: "Dr. Sarah Johnson", room: "Double - 308", status: "New Patient", avatarInitials: "MF" },
  { id: "309", name: "Pari Desai", age: 40, checkIn: "20/07/28", treatment: "Skin Allergy", doctor: "Dr. Luke Harrison", room: "Single - 309", status: "Inactive", avatarInitials: "PD" },
  { id: "310", name: "Omar Ali", age: 70, checkIn: "20/07/28", treatment: "Follow-Up Visit", doctor: "Dr. Andrew Peterson", room: "Single - 310", status: "Active", avatarInitials: "OA" },
  { id: "311", name: "Camila Alvarez", age: 30, checkIn: "20/07/28", treatment: "Cardiac Check-Up", doctor: "Dr. Olivia Martinez", room: "-", status: "Active", avatarInitials: "CA" },
  { id: "312", name: "Thabo van Rooyen", age: 15, checkIn: "20/07/28", treatment: "Pediatric Check-Up", doctor: "Dr. William Carter", room: "Double - 312", status: "New Patient", avatarInitials: "TV" },
];
