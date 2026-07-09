export function CostEstimateCard() {
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
          <span>LOC rate (Tier 3)</span>
          <span className="font-semibold text-slate-900">$248.00 / day</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Room rate (Semi-private)</span>
          <span className="font-semibold text-slate-900">$185.00 / day</span>
        </div>

        <div className="my-2 border-t border-slate-100" />

        <div className="flex justify-between text-slate-600">
          <span className="font-medium">Estimated daily</span>
          <span className="font-bold text-slate-900">$433.00</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span className="font-medium">Estimated monthly</span>
          <span className="font-bold text-slate-900">$13,163.00</span>
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
        Saving keeps this plan as Draft. Submit sends it to DON for review
        before it becomes Active.
      </p>
      <div className="text-sm font-semibold text-slate-800">
        Draft → Pending Review → Active
      </div>
    </div>
  );
}
