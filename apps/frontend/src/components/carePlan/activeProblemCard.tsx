import { Brain, Edit3 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";

/**
 * ActiveProblemCard component displaying information about the patient's active medical concern.
 */
export function ActiveProblemCard() {
  return (
    <Card className="border-brand-border hover:border-slate-350 flex flex-col justify-between overflow-hidden border bg-white text-left shadow-sm transition-all duration-300 hover:shadow-md">
      <div>
        {/* Header with icon and priority badge */}
        <CardHeader className="flex flex-row items-start justify-between p-6 pb-2">
          <div className="bg-brand-primary-dark/10 text-brand-primary-dark flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <Brain className="h-5.5 w-5.5 stroke-[2.2]" />
          </div>
          <Badge
            variant="priority"
            className="bg-brand-primary-light text-brand-primary-dark rounded-md border-transparent px-2 py-0.5 text-[10px] font-bold tracking-wider"
          >
            PRIORITY 1
          </Badge>
        </CardHeader>

        {/* Body Content */}
        <CardContent className="px-6 py-4">
          <h3 className="font-heading mb-3 text-lg leading-snug font-bold text-[#233955]">
            Decline in ADL related to Dementia
          </h3>
          <p className="text-sm leading-relaxed font-medium text-[#87888a]">
            Resident exhibits increasing difficulty with self-care tasks and
            cognitive orientation during morning routines.
          </p>
        </CardContent>
      </div>

      {/* Footer with doctor update information */}
      <CardFooter className="border-brand-border/60 text-brand-gray-muted flex items-center justify-between border-t bg-slate-50/50 px-6 py-4 text-xs font-semibold tracking-wide">
        <span className="flex items-center gap-1.5">
          <svg
            className="h-3.5 w-3.5 stroke-[2.2]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
            />
            <path d="M12 6V12L16 14" stroke="currentColor" />
          </svg>
          <span>Updated: Oct 24, 2023 by Dr. Miller</span>
        </span>
        <button
          type="button"
          onClick={() => {
            alert("Edit Active Problem");
          }}
          className="text-brand-primary-dark cursor-pointer rounded p-1 transition-colors hover:bg-slate-200/60"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
      </CardFooter>
    </Card>
  );
}
