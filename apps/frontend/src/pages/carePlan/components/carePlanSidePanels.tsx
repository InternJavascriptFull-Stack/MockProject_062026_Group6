type CostEstimateCardProps = {
  tier?: string;
  locRate?: number;
  roomRate?: number;
};

export function CostEstimateCard({
  tier = "Tier 3",
  locRate = 248.00,
  roomRate = 185.00
}: CostEstimateCardProps) {
  const estimatedDaily = locRate + roomRate;
  const estimatedMonthly = estimatedDaily * 30.4; // Average days in month

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Cost Estimate</h3>
        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-500">
          read-only
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>LOC rate ({tier})</span>
          <span className="font-semibold text-slate-900">${locRate.toFixed(2)} / day</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Room rate (Semi-private)</span>
          <span className="font-semibold text-slate-900">${roomRate.toFixed(2)} / day</span>
        </div>

        <div className="my-2 border-t border-slate-100" />

        <div className="flex justify-between text-slate-600">
          <span className="font-medium">Estimated daily</span>
          <span className="font-bold text-slate-900">${estimatedDaily.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span className="font-medium">Estimated monthly</span>
          <span className="font-bold text-slate-900">${estimatedMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        Simulated — not a billing transaction.
      </p>
    </div>
  );
}

export function PlanStatusCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-bold text-slate-900">Plan Status</h3>
      <p className="mb-4 text-sm text-slate-600">
        Saving keeps this plan as Draft. Submit sends it to DON for review, then it requires IDT signatures to become fully Signed.
      </p>
      <div className="text-sm font-semibold text-slate-800">
        Draft → Pending Review → Approved → Signed
      </div>
    </div>
  );
}
