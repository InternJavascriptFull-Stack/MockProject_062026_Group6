import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { Check, Lock } from "lucide-react";
import { session } from "../../utils/session";

export function DonReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carePlan, setCarePlan] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3000/api/care-plans/${id}`, {
      headers: { Authorization: `Bearer ${session.getAccessToken()}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) setCarePlan(data.data);
    })
    .catch(err => console.error("Failed to load care plan", err));
  }, [id]);

  const handleApprove = async () => {
    if (!password) return alert("Vui lòng nhập password e-signature!");

    // 1. Approve
    await fetch(`http://localhost:3000/api/care-plans/${id}/don-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.getAccessToken()}`
      },
      body: JSON.stringify({ status: "APPROVED", notes: "Approved by DON" })
    });
    // 2. E-sign
    await fetch(`http://localhost:3000/api/care-plans/${id}/esign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.getAccessToken()}`
      },
      body: JSON.stringify({ signatureToken: password })
    });
    setIsModalOpen(false);
    navigate(APP_ROUTES.CARE_PLANS);
  };

  const handleReject = async () => {
    if (!rejectReason) return alert("Vui lòng nhập lý do từ chối!");
    await fetch(`http://localhost:3000/api/care-plans/${id}/don-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.getAccessToken()}`
      },
      body: JSON.stringify({ status: "REJECTED", notes: rejectReason })
    });
    navigate(APP_ROUTES.CARE_PLANS);
  };

  if (!carePlan) return <div className="p-8">Đang tải dữ liệu Care Plan...</div>;

  const residentName = carePlan.resident ? `${carePlan.resident.firstName} ${carePlan.resident.lastName}` : "Unknown";

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
              <span>{residentName}</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">
                Review Care Plan — {residentName}
              </h1>
              <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                {carePlan.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Room 101A · LOC Tier 2 · Submitted on {new Date(carePlan.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Plan Summary (read-only)</h3>

                <div className="mb-6">
                  <h4 className="mb-3 font-bold text-slate-900">Goals</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {carePlan.goals?.map((g: any) => (
                      <li key={g.id} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {g.description}
                      </li>
                    ))}
                    {(!carePlan.goals || carePlan.goals.length === 0) && <li>No goals specified.</li>}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-bold text-slate-900">Interventions</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {carePlan.interventions?.map((i: any) => (
                      <li key={i.id} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {i.description}
                      </li>
                    ))}
                    {(!carePlan.interventions || carePlan.interventions.length === 0) && <li>No interventions specified.</li>}
                  </ul>
                </div>
              </div>

              {/* Author Accountability */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 font-bold text-slate-900">Author Accountability</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <div>
                    Prepared by: <span className="text-slate-900">Anna Lee, RN</span> <span className="mx-1">·</span> License #RN-482913 (CA)
                  </div>
                  <div>
                    Prepared on: <span className="text-slate-900">{new Date(carePlan.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-lg font-bold text-slate-900">Rejection reason</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-4 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add a reason to return this plan to the nurse as Draft..."
                />
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              {/* Compliance Checklist */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-1 font-bold text-slate-900">Compliance Checklist</h3>
                <p className="mb-4 text-[11px] text-slate-500">All items required to approve.</p>
                <div className="space-y-3 text-sm text-slate-700">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked readOnly className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                    <span>Plan started within 48h (CMS §483.21)</span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked readOnly className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                    <span>Comprehensive plan within 7 days</span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked readOnly className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                    <span>MDS 3.0 assessment linked</span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked readOnly className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                    <span>CA Title 22 items addressed</span>
                  </label>
                </div>
                <div className="mt-4 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                  4 / 4 complete
                </div>
              </div>

              {/* IDT Acknowledgment */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-1 font-bold text-slate-900">IDT Acknowledgment</h3>
                <p className="mb-4 text-[11px] text-slate-500">Auto-derived — not DON-tickable (§4A.2)</p>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-slate-500 text-xs">Physician</div>
                      <div className="font-bold text-slate-900">Dr. Alan Cho, MD</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Signed</span>
                      <span className="mt-1 text-[10px] text-slate-400">2026-07-02 14:10</span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-slate-500 text-xs">Dietary</div>
                      <div className="font-bold text-slate-900">Grace Liu, RD</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Signed</span>
                      <span className="mt-1 text-[10px] text-slate-400">2026-07-02 15:30</span>
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
                <button
                  onClick={handleReject}
                  className="mb-2 w-full rounded-md border border-red-500 bg-white py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                >
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

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-slate-700">Re-enter password to sign</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2.5 text-lg tracking-widest outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-md border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 rounded-md bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                Sign & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
