import { History } from "lucide-react";
import { Card } from "../ui/card";

/**
 * RecentObservationCard component showing the latest nursing observations.
 */
export function RecentObservationCard() {
  return (
    <Card className="border-brand-border flex flex-col items-start justify-between gap-4 border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:shadow-md md:flex-row md:items-center">
      {/* Left Info Section */}
      <div className="flex items-start gap-4">
        <div className="text-brand-primary-dark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 shadow-sm">
          <History className="h-5 w-5 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="font-heading mb-1 text-sm font-bold tracking-wide text-slate-800">
            Recent Observation
          </h4>
          <p className="text-brand-gray-muted max-w-2xl text-sm leading-relaxed font-medium italic">
            "Resident was alert but confused about breakfast time today. Managed
            to orient to current schedule with redirection and patience."
          </p>
        </div>
      </div>

      {/* Right Audit Section */}
      <div className="border-brand-border/60 flex w-full shrink-0 flex-col justify-center border-t pt-3 text-left md:w-auto md:border-t-0 md:pt-0 md:text-right">
        <span className="text-brand-primary-dark text-xs font-bold">
          Recorded by: Nurse J. Thompson
        </span>
        <span className="text-brand-gray-muted mt-0.5 text-[10px] font-bold tracking-wider uppercase">
          Today, 08:30 AM
        </span>
      </div>
    </Card>
  );
}
