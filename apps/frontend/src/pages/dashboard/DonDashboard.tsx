import { Clock, ShieldAlert, Activity, FileCheck, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../utils/session";
import { useDashboardQuery } from "./useDashboardQuery";
import { DashboardStatCard } from "../../components/dashboard/DashboardStatCard";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";

export function DonDashboard() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const { data, isLoading, isError, refetch } = useDashboardQuery("don");

    if (isLoading) return <LoadingState />;
    if (isError || !data || !data.success) {
        return <ErrorState onRetry={refetch} />;
    }

    const { data: dashboard } = data;

    return (
        <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-full">
            <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dashboard</div>
                <h1 className="text-3xl font-extrabold text-slate-900">Good morning, {user?.firstName || "Director"}</h1>
                <p className="mt-1 text-sm text-slate-500">Director of Nursing — Facility Overview</p>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard
                    title="Pending Review"
                    value={dashboard.pendingReview}
                    icon={<Clock />}
                    color="yellow"
                />
                <DashboardStatCard
                    title="Open Incidents"
                    value={dashboard.openIncidents}
                    icon={<ShieldAlert />}
                    color="red"
                />
                <DashboardStatCard
                    title="Reassessments Due"
                    value={dashboard.reassessmentsDue}
                    icon={<Activity />}
                    color="yellow"
                />
                <DashboardStatCard
                    title="Compliance Alerts"
                    value={dashboard.complianceAlerts}
                    icon={<FileCheck />}
                    color="purple"
                />
            </div>

            {dashboard.staffingAlert && (
                <div className="mb-8 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-bold text-red-700">{dashboard.staffingAlert}</span>
                </div>
            )}

            <div className="mb-8">
                <DashboardSection title="Care Plans Pending Review" linkText="View all" linkTo="/residents">
                    {dashboard.carePlansPendingReview.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">No care plans pending review.</div>
                    ) : (
                        <table className="w-full">
                            <caption className="sr-only">Care Plans Pending Review</caption>
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Resident</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Submitted By</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Submitted</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">LOC Tier</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Waiting</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {dashboard.carePlansPendingReview.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {plan.resident} · {plan.room}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{plan.submittedBy}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{plan.submittedDate}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{plan.locTier}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{plan.waiting}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                type="button" 
                                                onClick={() => navigate(`/care-plans/${plan.id}/review`)}
                                                className="text-sm font-bold text-blue-600 hover:text-blue-800"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </DashboardSection>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection title="Census + LOC Mix" linkText="View residents" linkTo="/residents">
                    <div className="p-6">
                        <div className="mb-6">
                            <p className="text-sm text-slate-500">Current Census</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-slate-900">
                                    {dashboard.censusAndLocMix?.current} / {dashboard.censusAndLocMix?.total} beds
                                </span>
                            </div>
                            <p className="text-sm font-bold text-green-600">{dashboard.censusAndLocMix?.occupancyRate}% occupancy</p>
                        </div>

                        <div className="space-y-4">
                            {dashboard.censusAndLocMix?.tiers?.map((tier, idx) => {
                                const colors = ["bg-green-500", "bg-blue-600", "bg-orange-500", "bg-red-600"];
                                const width = `${(tier.count / dashboard.censusAndLocMix.current) * 100}%`;
                                return (
                                    <div key={tier.label}>
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
                </DashboardSection>

                <DashboardSection 
                    title="Billing Snapshot" 
                    badge={<span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">read-only</span>}
                >
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-600">Est. daily revenue</span>
                            <span className="font-bold text-slate-900">${dashboard.billingSnapshot?.estDailyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-600">Est. monthly revenue</span>
                            <span className="font-bold text-slate-900">${dashboard.billingSnapshot?.estMonthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-600">Pending authorizations</span>
                            <span className="font-bold text-slate-900">{dashboard.billingSnapshot?.pendingAuthorizations} residents</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-600">Medicare 100-day cap alerts</span>
                            <span className="font-bold text-slate-900">{dashboard.billingSnapshot?.medicare100DayCapAlerts} resident</span>
                        </div>

                        <p className="mt-4 text-xs text-slate-400">Simulated — not a billing transaction.</p>
                    </div>
                </DashboardSection>
            </div>
        </div>
    );
}
