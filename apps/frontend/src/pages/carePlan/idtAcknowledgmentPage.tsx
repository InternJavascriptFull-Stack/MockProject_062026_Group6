import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CareAreaViewCard } from "./components/careAreaViewCard";
import { APP_ROUTES } from "../../constants/appRoutes";
import { session } from "../../utils/session";

export function IdtAcknowledgmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/care-plans/${id}`, {
      headers: { Authorization: `Bearer ${session.getAccessToken()}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) setCarePlan(data.data);
    })
    .catch(err => console.error("Lỗi lấy Care Plan", err));
  }, [id]);

  const handleAck = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`http://localhost:3000/api/care-plans/${id}/idt-ack`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.getAccessToken()}` 
        },
        body: JSON.stringify({ notes: "Đã đọc và xác nhận Care Plan" })
      });
      alert("Xác nhận IDT thành công!");
      navigate(APP_ROUTES.CARE_PLANS);
    } catch (err) {
      alert("Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!carePlan) return <div className="p-8">Đang tải...</div>;

  const residentName = carePlan.resident ? `${carePlan.resident.firstName} ${carePlan.resident.lastName}` : "Unknown";

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-slate-50/50">
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span className="cursor-pointer hover:underline">Pending Acknowledgment</span>
              <span>&gt;</span>
              <span>{residentName}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Care Plan Acknowledgment — {residentName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Submitted on {new Date(carePlan.createdAt).toLocaleDateString()} · {carePlan.status}
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

              {/* Thay vì Component phức tạp, ta dùng list để hiển thị cho chuẩn xác DB */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Goals & Interventions</h3>
                <div className="mb-6">
                  <h4 className="mb-3 font-bold text-slate-900">Goals</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {carePlan.goals?.map((g: any) => (
                      <li key={g.id} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {g.description}
                      </li>
                    ))}
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
                  </ul>
                </div>
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-bold text-slate-900">Your Role</h3>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Interdisciplinary Team Member</div>
                  <div className="text-xs text-slate-500">You are acknowledging this plan.</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 font-bold text-slate-900">IDT Acknowledgment</h3>
                <p className="mb-4 text-xs text-slate-500">
                  Your e-signature is recorded immutably and shown to DON.
                </p>
                <button 
                  onClick={handleAck}
                  disabled={isSubmitting}
                  className="mb-4 w-full rounded-md bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang xử lý..." : "Acknowledge & e-Sign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
