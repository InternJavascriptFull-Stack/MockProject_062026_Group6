import { CareAreaViewCard } from "./components/careAreaViewCard";

export function IdtAcknowledgmentPage() {
  const careAreas = [
    {
      title: "Mobility",
      badge: { text: "On Track", variant: "green" as const },
      goal: "Ambulate 50 ft with walker x2/day.",
      tasks: ["Assist ambulation w/ walker, 2x daily."],
    },
    {
      title: "Skin Integrity",
      badge: { text: "At Risk", variant: "yellow" as const },
      goal: "Maintain skin integrity (no stage-2 injury).",
      tasks: ["Reposition q2h; skin check each shift."],
    },
    {
      title: "Nutrition",
      badge: { text: "On Track", variant: "green" as const },
      goal: "Maintain fluid intake ≥ 1500 mL/day.",
      tasks: ["Monitor fluid intake; document I/O."],
    },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-slate-50/50">
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span className="cursor-pointer hover:underline">Pending Acknowledgment</span>
              <span>&gt;</span>
              <span>Robert Hayes</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Care Plan Acknowledgment — Robert Hayes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Submitted by Anna Lee, RN · Pending Review · 2026-07-02
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0">
              <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="text-sm text-slate-600">Read-only — care plan content cannot be edited here.</span>
                <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                  Read-only
                </span>
              </div>

              {careAreas.map((area, idx) => (
                <CareAreaViewCard key={idx} {...area} />
              ))}
            </div>

            <div className="min-w-0 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-bold text-slate-900">Your Role</h3>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Physician (Attending)</div>
                  <div className="text-xs text-slate-500">Dr. Alan Cho, MD · CA-MD-88231</div>
                  <div className="text-xs text-slate-500">NPI 1720493857</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 font-bold text-slate-900">IDT Acknowledgment</h3>
                <p className="mb-4 text-xs text-slate-500">
                  Your e-signature is recorded immutably and shown to DON.
                </p>
                <button className="mb-4 w-full rounded-md bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                  Acknowledge & e-Sign
                </button>
                
                <div className="pt-2">
                  <div className="text-[11px] text-slate-500 mb-1">Dietary status:</div>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Dietary</div>
                      <div className="text-xs font-bold text-slate-900">Grace Liu, RD</div>
                    </div>
                    <div className="ml-2">
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">Signed</span>
                      <div className="text-[9px] text-slate-500 mt-0.5">2026-07-02 15:30</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
