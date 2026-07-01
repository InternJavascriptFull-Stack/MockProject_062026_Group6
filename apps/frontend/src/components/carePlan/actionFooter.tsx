import { Lock } from "lucide-react";
import { Button } from "../ui/button";

/**
 * ActionFooter component sticky to the bottom providing session status and main action buttons.
 */
export function ActionFooter() {
  return (
    <footer className="border-brand-border sticky bottom-0 z-30 flex w-full flex-col items-center justify-between gap-4 border-t bg-white px-8 py-4 shadow-md sm:flex-row">
      {/* Left HIPAA Indicator */}
      <div className="text-brand-gray-muted flex items-center gap-2 select-none">
        <Lock className="h-4 w-4 text-[#87888a]" />
        <span className="text-xs font-semibold tracking-wider uppercase">
          HIPAA Compliant Session
        </span>
      </div>

      {/* Right Buttons Section */}
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <Button
          variant="outline"
          className="border-brand-border flex-1 cursor-pointer text-sm font-semibold shadow-sm hover:bg-slate-50 sm:flex-initial"
          onClick={() => alert("Add Progress Note")}
        >
          Add Progress Note
        </Button>
        <Button
          className="bg-brand-primary-dark flex-1 cursor-pointer text-sm font-semibold text-white shadow-sm hover:opacity-95 sm:flex-initial"
          onClick={() => alert("Update Care Plan")}
        >
          Update Care Plan
        </Button>
      </div>
    </footer>
  );
}
