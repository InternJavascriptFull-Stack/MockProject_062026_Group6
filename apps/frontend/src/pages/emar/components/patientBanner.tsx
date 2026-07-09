import { User, AlertTriangle } from "lucide-react";

export const patientInfo = {
  id: "PT-7892",
  name: "Nguyễn Văn A",
  age: 45,
  gender: "Male",
  bloodType: "O+",
  weight: "72 kg",
  height: "175 cm",
  allergies: ["Penicillin", "Peanuts"],
  room: "102-A",
  admissionDate: "2026-06-25",
};

export const PatientBanner = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0FDFA] rounded-full blur-3xl -mr-20 -mt-20 opacity-80 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center font-bold text-2xl border border-[#99F6E4] shadow-inner">
            NV
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {patientInfo.name}
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                {patientInfo.id}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1"><User className="w-4 h-4"/> {patientInfo.gender}, {patientInfo.age} yrs</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Room: <strong className="text-slate-700">{patientInfo.room}</strong></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Admitted: {patientInfo.admissionDate}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-3 w-full md:w-auto">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Allergies</p>
              <p className="text-sm font-medium text-rose-900 mt-0.5">{patientInfo.allergies.join(", ")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
