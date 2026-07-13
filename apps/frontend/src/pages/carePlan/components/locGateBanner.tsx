import { Info } from "lucide-react";

export function LocGateBanner({ tier = "Tier 2" }: { tier?: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
      <Info className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-semibold">
        LOC {tier} — Confirmed. Care plan can be created.
      </span>
    </div>
  );
}
