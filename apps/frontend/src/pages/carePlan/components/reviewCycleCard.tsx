export function ReviewCycleCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-bold text-slate-900">Review Cycle</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Last reviewed</span>
          <span className="font-semibold text-slate-900">2026-04-08</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Next review due</span>
          <span className="font-semibold text-slate-900">2026-07-07</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Cycle</span>
          <span className="font-semibold text-slate-900">90 days</span>
        </div>
      </div>
    </div>
  );
}
