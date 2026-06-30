export type StatusType = "Active" | "Inactive" | "New Patient";

export interface Patient {
  id: string;
  name: string;
  age: number;
  checkIn: string; // e.g. "20/07/28"
  treatment: string;
  doctor: string;
  room: string;
  status: StatusType;
  avatarInitials?: string;
}
