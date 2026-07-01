import { Flag } from "lucide-react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

/**
 * CareGoalCard component displaying the goal details and a 75% progress bar indicator.
 */
export function CareGoalCard() {
  return (
    <Card className="bg-brand-blue-subtle flex flex-col justify-between border border-[#b2ebed]/50 p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex-1">
        {/* Header Title with Flag Icon */}
        <div className="text-brand-primary-dark mb-4 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
          <Flag className="h-5 w-5 stroke-[2.5] text-teal-600" />
          <span>Care Goal</span>
        </div>

        {/* Main Quote text */}
        <blockquote className="mb-6 text-sm leading-relaxed font-semibold text-teal-950/80 italic">
          "Resident will maintain current level of mobility with assist of 1
          person and use of gait belt during all transfers for the next 90
          days."
        </blockquote>
      </div>

      {/* Bottom Progress Bar */}
      <div className="mt-auto space-y-2">
        <Progress
          value={75}
          className="h-2 bg-teal-100"
          barClassName="bg-teal-500"
        />
        <div className="text-teal-850/80 flex items-center justify-between text-xs font-bold tracking-wide">
          <span>75% progress towards goal milestone</span>
        </div>
      </div>
    </Card>
  );
}
