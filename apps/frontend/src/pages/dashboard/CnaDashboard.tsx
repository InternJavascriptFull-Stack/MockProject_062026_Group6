import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboard";
import { User as UserIcon, AlertCircle, FileText } from "lucide-react";
import { session } from "../../utils/session";

export function CnaDashboard() {
    const [data, setData] = useState<any>(null);
    const user = session.getUser();

    useEffect(() => {
        dashboardService.getCnaDashboard().then((res) => {
            if (res.success) setData(res.data);
        });
    }, []);

    if (!data) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="flex h-full flex-col bg-[#F8FAFC]">
            <div className="mb-6">
                <h2 className="text-sm font-medium text-slate-500">Dashboard</h2>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">Good morning, {user?.firstName}</h1>
                <p className="mt-2 text-sm text-slate-500">
                    {data.shiftInfo} · {data.shiftTime}
                </p>
            </div>

            <div className="mb-8 grid grid-cols-3 gap-6">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                        <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Today's Tasks</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {data.todaysTasks?.completed} / {data.todaysTasks?.total}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Abnormal Flags Reported</p>
                        <p className="text-2xl font-bold text-slate-900">{data.abnormalFlagsReported}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                        <UserIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Assigned Residents</p>
                        <p className="text-2xl font-bold text-slate-900">{data.assignedResidents}</p>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h3 className="font-bold text-slate-900">Upcoming Tasks</h3>
                    <a href="/care-tasks/today" className="text-sm font-medium text-blue-600 hover:underline">
                        Go to Daily Task List
                    </a>
                </div>
                <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Resident</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Due</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.upcomingTasks?.map((task: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                    {task.resident} · {task.room}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{task.task}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{task.due}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                            task.status === "Done"
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : task.status === "Missed"
                                                  ? "border-red-200 bg-red-50 text-red-700"
                                                  : "border-slate-200 bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        {task.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
