import React from "react";
import { X } from "lucide-react";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddScheduleModal = ({ isOpen, onClose }: AddScheduleModalProps) => {
  const [doctorName, setDoctorName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [color, setColor] = React.useState("teal");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-xl font-bold text-[#233955]">Add New Schedule</div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors -mr-1.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#233955]">Doctor Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. John Davis"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#233955]">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      if ("showPicker" in HTMLInputElement.prototype) {
                        e.currentTarget.showPicker();
                      }
                    } catch (err) {}
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm min-h-[38px] cursor-pointer"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-[#233955]">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  onClick={(e) => {
                    try {
                      if ("showPicker" in HTMLInputElement.prototype) {
                        e.currentTarget.showPicker();
                      }
                    } catch (err) {}
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm min-h-[38px] cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#233955]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none shadow-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#233955]">Color Variant</label>
              <div className="flex gap-6">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="color"
                    value="teal"
                    checked={color === "teal"}
                    onChange={() => setColor("teal")}
                    className="peer sr-only"
                  />
                  <span className="block h-5 w-5 rounded-full bg-[#A2F2EE] ring-2 ring-transparent ring-offset-2 transition-all peer-checked:ring-[#A2F2EE]" />
                  <span className="text-sm font-medium text-[#4B4D4F]">Teal</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="color"
                    value="blue"
                    checked={color === "blue"}
                    onChange={() => setColor("blue")}
                    className="peer sr-only"
                  />
                  <span className="block h-5 w-5 rounded-full bg-[#DFF8F9] ring-2 ring-transparent ring-offset-2 transition-all peer-checked:ring-[#DFF8F9] border border-slate-200" />
                  <span className="text-sm font-medium text-[#4B4D4F]">Blue</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#1E293B] px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            Add Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
