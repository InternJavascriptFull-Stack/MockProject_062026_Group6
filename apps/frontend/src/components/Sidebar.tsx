import {
  Logo,
  SquareFourIcon,
  CheckSquareIcon,
  BedIcon,
  StethoscopeIcon,
  HospitalIcon,
  CalendarDotsIcon,
  CreditCardIcon,
  CubeIcon,
  ChatIcon,
} from "../icon/icon";

import { cn } from "../utils/cn";

const menuItems = [
  { icon: SquareFourIcon, active: false },
  { icon: CheckSquareIcon, active: false },
  { icon: BedIcon, active: true },
  { icon: StethoscopeIcon, active: false },
  { icon: HospitalIcon, active: false },
  { icon: CalendarDotsIcon, active: false },
  { icon: CreditCardIcon, active: false },
  { icon: CubeIcon, active: false },
  { icon: ChatIcon, active: false, badge: true },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[90px] bg-white border-r border-[#ECECEC] flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-10">
        <Logo className="w-[22px] h-[22px]" />
      </div>

      {/* Menu */}
      <nav className="flex flex-1 flex-col items-center gap-5 w-full">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="relative">
              <button
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200",
                  item.active
                    ? "bg-[#A2F2EE]"
                    : "hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
              </button>

              {item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
