import { Layers, FileEdit, Clock, AlarmClock, XCircle } from "lucide-react";

export function CarePlanSummaryCards({ total = 24, draftCount = 5, pendingCount = 3, reviewDueCount = 2, rejectedCount = 1 }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Total plans</p>
          <p className="text-2xl font-bold text-slate-900">{total}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-500">
          <FileEdit className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Draft</p>
          <p className="text-2xl font-bold text-slate-900">{draftCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Pending Review</p>
          <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <XCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Rejected</p>
          <p className="text-2xl font-bold text-slate-900">{rejectedCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
          <AlarmClock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Review Due</p>
          <p className="text-2xl font-bold text-slate-900">{reviewDueCount}</p>
        </div>
      </div>
    </div>
  );
}
