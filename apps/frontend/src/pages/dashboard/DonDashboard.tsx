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
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="mb-6">
        <h2 className="text-sm text-slate-500 font-medium">Dashboard</h2>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Good morning, {user?.firstName || "Denise"}</h1>
        <p className="text-sm text-slate-500 mt-2">Facility overview — Riverside Wing</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-slate-900">{data.pendingReview}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Open Incidents</p>
            <p className="text-2xl font-bold text-slate-900">{data.openIncidents}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <Activity className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Reassessments Due</p>
            <p className="text-2xl font-bold text-slate-900">{data.reassessmentsDue}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Compliance Alerts</p>
            <p className="text-2xl font-bold text-slate-900">{data.complianceAlerts}</p>
          </div>
        </div>
      </div>

      {data.staffingAlert && (
        <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-bold text-red-700">{data.staffingAlert}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Care Plans Pending Review</h3>
          <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View all</a>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
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
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{plan.resident} · {plan.room}</td>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Census + LOC Mix</h3>
            <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View residents</a>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-slate-500">Current Census</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{data.censusAndLocMix?.current} / {data.censusAndLocMix?.total} beds</span>
            </div>
            <p className="text-sm font-bold text-green-600">{data.censusAndLocMix?.occupancyRate}% occupancy</p>
          </div>

          <div className="space-y-4">
            {data.censusAndLocMix?.tiers?.map((tier: any, idx: number) => {
              const colors = ['bg-green-500', 'bg-blue-600', 'bg-orange-500', 'bg-red-600'];
              const width = `${(tier.count / data.censusAndLocMix.current) * 100}%`;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{tier.label}</span>
                    <span className="font-bold text-slate-900">{tier.count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[idx % colors.length]}`} style={{ width }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Billing Snapshot</h3>
            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md">read-only</span>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-sm text-slate-600">Est. daily revenue</span>
              <span className="font-bold text-slate-900">${data.billingSnapshot?.estDailyRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-sm text-slate-600">Est. monthly revenue</span>
              <span className="font-bold text-slate-900">${data.billingSnapshot?.estMonthlyRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-sm text-slate-600">Pending authorizations</span>
              <span className="font-bold text-slate-900">{data.billingSnapshot?.pendingAuthorizations} residents</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-sm text-slate-600">Medicare 100-day cap alerts</span>
              <span className="font-bold text-slate-900">{data.billingSnapshot?.medicare100DayCapAlerts} resident</span>
            </div>
            
            <p className="text-xs text-slate-400 mt-4">Simulated — not a billing transaction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
