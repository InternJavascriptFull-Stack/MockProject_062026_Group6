import { Settings, Bell, ChevronDown } from "lucide-react";
import { Avatar } from "./Avatar";

export function Header() {
  return (
    <header className="flex h-[90px] items-center justify-between bg-white px-8">
      <h1 className="text-3xl font-bold text-navy">Patients</h1>

      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-gray text-navy hover:bg-gray-200 transition">
          <Settings className="h-5 w-5" />
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-soft-gray text-navy hover:bg-gray-200 transition">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-soft-gray" />
        </button>

        <div className="flex items-center gap-2 rounded-full bg-soft-gray p-1 pl-1 pr-3 cursor-pointer hover:bg-gray-200 transition">
          <Avatar className="h-8 w-8 " />
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </header>
  );
}
