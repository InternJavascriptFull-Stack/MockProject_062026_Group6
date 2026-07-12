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
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="mb-6">
        <h2 className="text-sm text-slate-500 font-medium">Dashboard</h2>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Good morning, {user?.firstName}</h1>
        <p className="text-sm text-slate-500 mt-2">{data.shiftInfo} · {data.shiftTime}</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Today's Tasks</p>
            <p className="text-2xl font-bold text-slate-900">{data.todaysTasks?.completed} / {data.todaysTasks?.total}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Abnormal Flags Reported</p>
            <p className="text-2xl font-bold text-slate-900">{data.abnormalFlagsReported}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Assigned Residents</p>
            <p className="text-2xl font-bold text-slate-900">{data.assignedResidents}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Upcoming Tasks</h3>
          <a href="#" className="text-sm text-blue-600 font-medium hover:underline">Go to Daily Task List</a>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
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
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{task.resident} · {task.room}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{task.task}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{task.due}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    task.status === 'Done' ? 'bg-green-50 text-green-700 border-green-200' :
                    task.status === 'Missed' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
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
