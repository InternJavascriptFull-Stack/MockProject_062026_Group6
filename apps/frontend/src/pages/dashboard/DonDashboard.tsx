import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboard";
import { Clock, ShieldAlert, Activity, FileCheck, AlertTriangle } from "lucide-react";
import { session } from "../../utils/session";

export function DonDashboard() {
    const [data, setData] = useState<any>(null);
    const user = session.getUser();

    useEffect(() => {
        dashboardService.getDonDashboard().then((res) => {
            if (res.success) setData(res.data);
        });
    }, []);

    if (!data) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="flex h-full flex-col bg-[#F8FAFC]">
            <div className="mb-6">
                <h2 className="text-sm font-medium text-slate-500">Dashboard</h2>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">Good morning, {user?.firstName || "Denise"}</h1>
                <p className="mt-2 text-sm text-slate-500">Facility overview — Riverside Wing</p>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-6">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
                        <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Pending Review</p>
                        <p className="text-2xl font-bold text-slate-900">{data.pendingReview}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <ShieldAlert className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Open Incidents</p>
                        <p className="text-2xl font-bold text-slate-900">{data.openIncidents}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
                        <Activity className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Reassessments Due</p>
                        <p className="text-2xl font-bold text-slate-900">{data.reassessmentsDue}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
                        <FileCheck className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Compliance Alerts</p>
                        <p className="text-2xl font-bold text-slate-900">{data.complianceAlerts}</p>
                    </div>
                </div>
            </div>

            {data.staffingAlert && (
                <div className="mb-8 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-bold text-red-700">{data.staffingAlert}</span>
                </div>
            )}

            <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h3 className="font-bold text-slate-900">Care Plans Pending Review</h3>
                    <a href="/residents" className="text-sm font-medium text-blue-600 hover:underline">
                        View all
                    </a>
                </div>
                <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Resident</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Submitted By</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Submitted</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">LOC Tier</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Waiting</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.carePlansPendingReview?.map((plan: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                    {plan.resident} · {plan.room}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{plan.submittedBy}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{plan.submittedDate}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{plan.locTier}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{plan.waiting}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-sm font-bold text-blue-600 hover:text-blue-800">Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Census + LOC Mix</h3>
                        <a href="/residents" className="text-sm font-medium text-blue-600 hover:underline">
                            View residents
                        </a>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-slate-500">Current Census</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900">
                                {data.censusAndLocMix?.current} / {data.censusAndLocMix?.total} beds
                            </span>
                        </div>
                        <p className="text-sm font-bold text-green-600">{data.censusAndLocMix?.occupancyRate}% occupancy</p>
                    </div>

                    <div className="space-y-4">
                        {data.censusAndLocMix?.tiers?.map((tier: any, idx: number) => {
                            const colors = ["bg-green-500", "bg-blue-600", "bg-orange-500", "bg-red-600"];
                            const width = `${(tier.count / data.censusAndLocMix.current) * 100}%`;
                            return (
                                <div key={idx}>
                                    <div className="mb-1 flex justify-between text-sm">
                                        <span className="text-slate-600">{tier.label}</span>
                                        <span className="font-bold text-slate-900">{tier.count}</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div className={`h-full ${colors[idx % colors.length]}`} style={{ width }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Billing Snapshot</h3>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">read-only</span>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-600">Est. daily revenue</span>
                            <span className="font-bold text-slate-900">${data.billingSnapshot?.estDailyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-600">Est. monthly revenue</span>
                            <span className="font-bold text-slate-900">${data.billingSnapshot?.estMonthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-600">Pending authorizations</span>
                            <span className="font-bold text-slate-900">{data.billingSnapshot?.pendingAuthorizations} residents</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-600">Medicare 100-day cap alerts</span>
                            <span className="font-bold text-slate-900">{data.billingSnapshot?.medicare100DayCapAlerts} resident</span>
                        </div>

                        <p className="mt-4 text-xs text-slate-400">Simulated — not a billing transaction.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
