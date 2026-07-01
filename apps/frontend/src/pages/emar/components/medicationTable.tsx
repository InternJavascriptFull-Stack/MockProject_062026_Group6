import { Pill, Clock, CheckCircle, XCircle } from "lucide-react";

export const medications = [
  {
    id: "m1",
    name: "Amoxicillin",
    dosage: "500mg",
    route: "PO (Oral)",
    frequency: "TID (3 times/day)",
    schedule: ["08:00", "14:00", "20:00"],
    status: { "08:00": "administered", "14:00": "pending", "20:00": "pending" },
    notes: "Take with food",
    type: "antibiotic"
  },
  {
    id: "m2",
    name: "Lisinopril",
    dosage: "10mg",
    route: "PO (Oral)",
    frequency: "QD (Daily)",
    schedule: ["08:00"],
    status: { "08:00": "missed" },
    notes: "Monitor blood pressure",
    type: "cardiac"
  },
  {
    id: "m3",
    name: "Morphine Sulfate",
    dosage: "4mg",
    route: "IV",
    frequency: "Q4H PRN",
    schedule: ["PRN"],
    status: { "PRN": "pending" },
    notes: "For severe pain > 7/10",
    type: "analgesic"
  }
];

export const MedicationTable = () => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'administered': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'missed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'administered': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">Given</span>;
      case 'missed': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Missed</span>;
      case 'pending': 
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">Due</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Medication Details</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">08:00</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">14:00</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">20:00</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">PRN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {medications.map((med) => (
              <tr key={med.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6 align-top">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-1 ${med.type === 'antibiotic' ? 'bg-indigo-100 text-indigo-600' : med.type === 'cardiac' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">{med.name}</h3>
                      <p className="text-sm font-medium text-slate-600 mt-1">{med.dosage} • {med.route}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {med.frequency}
                      </p>
                      {med.notes && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 inline-block mt-2 font-medium">
                          {med.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                
                {/* Time Slots */}
                {["08:00", "14:00", "20:00", "PRN"].map((time) => {
                  const status = med.status[time as keyof typeof med.status];
                  const isScheduled = med.schedule.includes(time);
                  
                  return (
                    <td key={time} className="py-4 px-4 align-top text-center border-l border-slate-100">
                      {isScheduled ? (
                        <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[100px]">
                          {getStatusIcon(status)}
                          {getStatusBadge(status)}
                          {status === 'pending' && (
                            <button className="mt-2 px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95">
                              Administer
                            </button>
                          )}
                          {status === 'missed' && (
                            <span className="text-xs text-slate-400 mt-1">Reason required</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[100px]">
                          <span className="w-4 h-px bg-slate-300"></span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
