import { AlertTriangle, ShieldAlert, HeartCrack } from "lucide-react";
import eleanorRigbyAvatar from "../../assets/eleanorRigby.png";
import { Badge } from "../ui/badge";

/**
 * PatientBanner component displaying patient demographics and warning alerts.
 */
export function PatientBanner() {
  return (
    <header className="border-brand-border flex w-full flex-col items-start justify-between gap-4 border-b bg-white px-8 py-5 sm:flex-row sm:items-center">
      {/* Left Demographics Section */}
      <div className="flex items-center gap-4 text-left">
        <div className="relative">
          <img
            src={eleanorRigbyAvatar}
            alt="Eleanor Rigby"
            className="border-brand-border h-12 w-12 rounded-full border object-cover shadow-sm"
          />
          <div className="absolute right-0 bottom-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-teal-400">
            <svg
              className="h-2 w-2 stroke-[3.5] text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="font-heading text-brand-primary-dark mb-1.5 text-xl leading-none font-bold tracking-tight">
            Eleanor Rigby
          </h2>
          <p className="text-brand-gray-muted flex items-center gap-2 text-xs font-bold tracking-wide">
            <span>Room 102-B</span>
            <span className="text-slate-300">•</span>
            <span>Age: 84</span>
            <span className="text-slate-300">•</span>
            <span>ID: #99281-ER</span>
          </p>
        </div>
      </div>

      {/* Right Warning Tags Section */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* DNR/DNI Warning Tag */}
        <Badge
          variant="warning"
          className="flex items-center gap-1.5 rounded-lg border border-red-200/50 px-3 py-1.5 text-xs font-bold tracking-wider uppercase"
        >
          <AlertTriangle className="h-4 w-4 stroke-[2.2]" />
          <span>DNR/DNI</span>
        </Badge>

        {/* Allergy Warning Tag */}
        <Badge
          variant="warning"
          className="flex items-center gap-1.5 rounded-lg border border-red-200/50 px-3 py-1.5 text-xs font-bold tracking-wider uppercase"
        >
          <HeartCrack className="h-4 w-4 stroke-[2.2]" />
          <span>Allergy: Penicillin</span>
        </Badge>

        {/* High Fall Risk Warning Tag */}
        <Badge
          variant="muted"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200/60 bg-[#e6e6e7] px-3 py-1.5 text-xs font-bold tracking-wider text-[#4b4d4f] uppercase"
        >
          <ShieldAlert className="h-4 w-4 stroke-[2.2]" />
          <span>High Fall Risk</span>
        </Badge>
      </div>
    </header>
  );
}
