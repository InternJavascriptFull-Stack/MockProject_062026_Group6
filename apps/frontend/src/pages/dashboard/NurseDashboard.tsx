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
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="mb-6">
        <h2 className="text-sm text-slate-500 font-medium">Dashboard</h2>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Good morning, {user?.firstName}</h1>
        <p className="text-sm text-slate-500 mt-2">12 residents assigned to you — Day shift</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Assessments Due</p>
            <p className="text-2xl font-bold text-slate-900">{data.assessmentsDue}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Layers className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">LOC Awaiting Confirm</p>
            <p className="text-2xl font-bold text-slate-900">{data.locAwaitingConfirm}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
            <Edit3 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Care Plans To Submit</p>
            <p className="text-2xl font-bold text-slate-900">{data.carePlansToSubmit}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Reassessments Due</p>
            <p className="text-2xl font-bold text-slate-900">{data.reassessmentsDue}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Assigned Residents — Due Soon</h3>
            <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View all</a>
          </div>
          <div className="divide-y divide-slate-200">
            {data.assignedResidentsDueSoon?.map((item: any, idx: number) => (
              <div key={idx} className="p-6 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">{item.resident} · {item.room}</h4>
                  <p className="text-sm text-slate-500 mt-1">{item.task}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  item.type === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                  item.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  item.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Open Incidents</h3>
            <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View all</a>
          </div>
          <div className="divide-y divide-slate-200">
            {data.openIncidents?.map((inc: any, idx: number) => (
              <div key={idx} className="p-6 flex justify-between items-start hover:bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">{inc.type} — {inc.resident} {inc.room ? `· ${inc.room}` : ''}</h4>
                  <p className="text-sm text-slate-500 mt-1">{inc.detail}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  inc.severity === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                  inc.severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {inc.severity === 'neutral' ? 'soon' : inc.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
