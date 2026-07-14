import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboard";
import { FileText, Layers, Edit3, Clock } from "lucide-react";
import { session } from "../../utils/session";

export function NurseDashboard() {
    const [data, setData] = useState<any>(null);
    const user = session.getUser();

    useEffect(() => {
        dashboardService.getNurseDashboard().then((res) => {
            if (res.success) setData(res.data);
        });
    }, []);

    if (!data) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="flex h-full flex-col bg-[#F8FAFC]">
            <div className="mb-6">
                <h2 className="text-sm font-medium text-slate-500">Dashboard</h2>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">Good morning, {user?.firstName}</h1>
                <p className="mt-2 text-sm text-slate-500">12 residents assigned to you — Day shift</p>
            </div>

            <div className="mb-8 grid grid-cols-4 gap-6">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
                        <FileText className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Assessments Due</p>
                        <p className="text-2xl font-bold text-slate-900">{data.assessmentsDue}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                        <Layers className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">LOC Awaiting Confirm</p>
                        <p className="text-2xl font-bold text-slate-900">{data.locAwaitingConfirm}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                        <Edit3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Care Plans To Submit</p>
                        <p className="text-2xl font-bold text-slate-900">{data.carePlansToSubmit}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <Clock className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Reassessments Due</p>
                        <p className="text-2xl font-bold text-slate-900">{data.reassessmentsDue}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h3 className="font-bold text-slate-900">Assigned Residents — Due Soon</h3>
                        <a href="/residents" className="text-sm font-medium text-blue-600 hover:underline">
                            View all
                        </a>
                    </div>
                    <div className="divide-y divide-slate-200">
                        {data.assignedResidentsDueSoon?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-slate-900">
                                        {item.resident} · {item.room}
                                    </h4>
                                    <p className="mt-1 text-sm text-slate-500">{item.task}</p>
                                </div>
                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                        item.type === "overdue"
                                            ? "border-red-200 bg-red-50 text-red-700"
                                            : item.type === "warning"
                                              ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                                              : item.type === "success"
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : "border-slate-200 bg-slate-100 text-slate-700"
                                    }`}
                                >
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h3 className="font-bold text-slate-900">Open Incidents</h3>
                        <a href="/incidents" className="text-sm font-medium text-blue-600 hover:underline">
                            View all
                        </a>
                    </div>
                    <div className="divide-y divide-slate-200">
                        {data.openIncidents?.map((inc: any, idx: number) => (
                            <div key={idx} className="flex items-start justify-between p-6 hover:bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-slate-900">
                                        {inc.type} — {inc.resident} {inc.room ? `· ${inc.room}` : ""}
                                    </h4>
                                    <p className="mt-1 text-sm text-slate-500">{inc.detail}</p>
                                </div>
                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                        inc.severity === "High"
                                            ? "border-red-200 bg-red-50 text-red-700"
                                            : inc.severity === "Medium"
                                              ? "border-orange-200 bg-orange-50 text-orange-700"
                                              : "border-slate-200 bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    {inc.severity === "neutral" ? "soon" : inc.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
