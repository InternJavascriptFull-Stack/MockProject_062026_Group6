import { FileText, Layers, Edit3, Clock } from "lucide-react";
import { useAuthStore } from "../../utils/session";
import { useDashboardQuery } from "./useDashboardQuery";
import { DashboardStatCard } from "../../components/dashboard/DashboardStatCard";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";

export function NurseDashboard() {
    const user = useAuthStore((state) => state.user);
    const { data, isLoading, isError, refetch } = useDashboardQuery("nurse");

    if (isLoading) return <LoadingState />;
    if (isError || !data || !data.success) {
        return <ErrorState onRetry={refetch} />;
    }

    const { data: dashboard } = data;

    return (
        <div className="flex h-full flex-col bg-slate-50">
            <div className="mb-6">
                <h2 className="text-sm font-medium text-slate-500">Dashboard</h2>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">Good morning, {user?.firstName}</h1>
                <p className="mt-2 text-sm text-slate-500">
                    {dashboard.assignedResidentsDueSoon.length} assigned residents requiring attention
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard
                    title="Assessments Due"
                    value={dashboard.assessmentsDue}
                    icon={<FileText />}
                    color="yellow"
                />
                <DashboardStatCard
                    title="LOC Awaiting Confirm"
                    value={dashboard.locAwaitingConfirm}
                    icon={<Layers />}
                    color="blue"
                />
                <DashboardStatCard
                    title="Care Plans To Submit"
                    value={dashboard.carePlansToSubmit}
                    icon={<Edit3 />}
                    color="orange"
                />
                <DashboardStatCard
                    title="Reassessments Due"
                    value={dashboard.reassessmentsDue}
                    icon={<Clock />}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection title="Assigned Residents — Due Soon" linkText="View all" linkTo="/residents">
                    {dashboard.assignedResidentsDueSoon.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">No residents due soon.</div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {dashboard.assignedResidentsDueSoon.map((item) => (
                                <div key={item.resident + item.room} className="flex items-center justify-between p-6 hover:bg-slate-50">
                                    <div>
                                        <h4 className="font-bold text-slate-900">
                                            {item.resident} · {item.room}
                                        </h4>
                                        <p className="mt-1 text-sm text-slate-500">{item.task}</p>
                                    </div>
                                    <StatusPill status={item.status} type={item.type as any} />
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardSection>

                <DashboardSection title="Open Incidents" linkText="View all" linkTo="/incidents">
                    {dashboard.openIncidents.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">No open incidents.</div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {dashboard.openIncidents.map((inc) => (
                                <div key={inc.resident + inc.type} className="flex items-start justify-between p-6 hover:bg-slate-50">
                                    <div>
                                        <h4 className="font-bold text-slate-900">
                                            {inc.type} — {inc.resident} {inc.room ? `· ${inc.room}` : ""}
                                        </h4>
                                        <p className="mt-1 text-sm text-slate-500">{inc.detail}</p>
                                    </div>
                                    <StatusPill
                                        status={inc.severity === "neutral" ? "soon" : inc.severity}
                                        type={inc.severity === "High" ? "error" : inc.severity === "Medium" ? "warning" : "neutral"}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardSection>
            </div>
        </div>
    );
}
