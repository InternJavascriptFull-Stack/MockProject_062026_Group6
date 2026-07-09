import { useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { Check, Lock } from "lucide-react";

export function DonReviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-slate-50/50">
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Link to={APP_ROUTES.CARE_PLANS} className="hover:underline">
                Care Planning
              </Link>
              <span>&gt;</span>
              <span>Review</span>
              <span>&gt;</span>
              <span>Robert Hayes</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">
                Review Care Plan — Robert Hayes
              </h1>
              <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                Pending Review
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Room 204B · LOC Tier 3 · Submitted by Anna Lee, RN · 2026-07-02
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Plan Summary (read-only)</h3>
                
                <div className="mb-6">
                  <h4 className="mb-3 font-bold text-slate-900">Goals</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      Ambulate 50 ft with walker x2/day by 2026-07-30.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      Maintain skin integrity through review cycle.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      Maintain fluid intake ≥ 1500 mL/day.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-bold text-slate-900">Interventions</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      Assist ambulation w/ walker 2x daily.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      Reposition q2h; skin checks each shift.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      Monitor & document fluid intake.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Author Accountability</h3>
                <div className="space-y-1 text-sm text-slate-700">
                  <p>
                    Prepared by: <span className="font-semibold">Anna Lee, RN</span> · License #RN-482913 (CA)
                  </p>
                  <p>Prepared on: 2026-07-02 16:40</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-lg font-bold text-slate-900">Rejection reason <span className="text-sm font-normal text-slate-500">(required if rejecting)</span></h3>
                <textarea
                  className="mt-4 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add a reason to return this plan to the nurse as Draft..."
                />
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 font-bold text-slate-900">Compliance Checklist</h3>
                <p className="mb-4 text-sm text-slate-500">All items required to approve.</p>
                
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>Plan started within 48h (CMS §483.21)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>Comprehensive plan within 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>MDS 3.0 assessment linked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>CA Title 22 items addressed</span>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  4 / 4 complete
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-1 font-bold text-slate-900">IDT Acknowledgment</h3>
                <p className="mb-4 text-[11px] text-slate-400">Auto-derived — not DON-tickable (§4A.2)</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-700">Physician</div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Dr. Alan Cho, MD</span>
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">Signed</span>
                      <span className="text-[10px] text-slate-500">2026-07-02 14:10</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">Dietary</div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Grace Liu, RD</span>
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">Signed</span>
                      <span className="text-[10px] text-slate-500">2026-07-02 15:30</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-bold text-slate-900">Decision</h3>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mb-3 w-full rounded-md bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Approve & e-Sign
                </button>
                <button className="mb-2 w-full rounded-md border border-red-500 bg-white py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                  Reject & Return
                </button>
                <p className="text-center text-[11px] text-slate-400">
                  Approve requires e-signature re-auth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SC_031 E-signature Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-bold text-slate-900">Electronic Signature Required</h2>
            <p className="mb-6 text-sm text-slate-500">
              Approving activates this care plan and generates downstream tasks & billing.
            </p>

            <div className="mb-6 flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white font-bold text-slate-600">
                D
              </div>
              <div>
                <p className="font-bold text-slate-900">Denise Carter, DON</p>
                <p className="text-xs text-slate-500">Signing as Director of Nursing</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-slate-700">Re-enter password to sign</label>
              <div className="relative">
                <input
                  type="password"
                  value="..........."
                  readOnly
                  className="w-full rounded-md border border-slate-200 p-2.5 text-lg tracking-widest outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="mb-6 flex items-start gap-2">
              <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded bg-blue-600">
                <Check className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm text-slate-700">
                I attest this plan is compliant and ready for activation.
              </p>
            </div>

            <div className="mb-8 space-y-1 text-xs text-slate-500">
              <p>Signature timestamp: 2026-07-02 17:02 PDT</p>
              <p>Recorded immutably in audit log.</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-md border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-md bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                Sign & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
