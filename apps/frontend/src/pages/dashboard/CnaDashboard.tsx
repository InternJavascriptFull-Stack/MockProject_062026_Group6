import { User as UserIcon, AlertCircle, FileText } from "lucide-react";
import { useAuthStore } from "../../utils/session";
import { useDashboardQuery } from "./useDashboardQuery";
import { DashboardStatCard } from "../../components/dashboard/DashboardStatCard";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { StatusPill } from "../../components/dashboard/StatusPill";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";

export function CnaDashboard() {
    const user = useAuthStore((state) => state.user);
    const { data, isLoading, isError, refetch } = useDashboardQuery("cna");

    if (isLoading) return <LoadingState />;
    if (isError || !data || !data.success) {
        return <ErrorState onRetry={refetch} />;
    }

    const { data: dashboard } = data;

    return (
        <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-full">
            <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dashboard</div>
                <h1 className="text-3xl font-extrabold text-slate-900">Good morning, {user?.firstName || "CNA"}</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {dashboard.shiftInfo} · {dashboard.shiftTime}
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardStatCard
                    title="Today's Tasks"
                    value={`${dashboard.todaysTasks?.completed} / ${dashboard.todaysTasks?.total}`}
                    icon={<FileText />}
                    color="blue"
                />
                <DashboardStatCard
                    title="Abnormal Flags Reported"
                    value={dashboard.abnormalFlagsReported}
                    icon={<AlertCircle />}
                    color="red"
                />
                <DashboardStatCard
                    title="Assigned Residents"
                    value={dashboard.assignedResidents}
                    icon={<UserIcon />}
                    color="green"
                />
            </div>

            <DashboardSection title="Upcoming Tasks" linkText="Go to Daily Task List" linkTo="/care-tasks/today">
                {dashboard.upcomingTasks.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">No upcoming tasks.</div>
                ) : (
                    <table className="w-full">
                        <caption className="sr-only">Upcoming Tasks List</caption>
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Resident</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Task</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Due</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {dashboard.upcomingTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                        {task.resident} · {task.room}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{task.task}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{task.due}</td>
                                    <td className="px-6 py-4">
                                        <StatusPill 
                                            status={task.status} 
                                            type={task.status === "Done" ? "success" : task.status === "Missed" ? "error" : "neutral"} 
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </DashboardSection>
        </div>
    );
}
