import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Lock, ShieldAlert } from 'lucide-react';

interface LOCGateViewProps {
  residentName: string;
  roomNumber?: string;
  locStatus?: string;
  residentId?: string;
}

export const LOCGateView: React.FC<LOCGateViewProps> = ({
  residentName,
  roomNumber,
  locStatus = 'Suggested (Unconfirmed)',
  residentId,
}) => {
  const navigate = useNavigate();

  const handleGoToLOC = () => {
    if (residentId) {
      navigate(`/assessments/history?residentId=${residentId}`);
    } else {
      navigate('/assessments/history');
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-12 px-4 font-sans">
      {/* Header Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-xs mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-700 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                <Lock className="w-3 h-3" /> SC_028 — LOC Gate Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-amber-950 mt-1">
              Care Plan Creation Blocked for {residentName}
            </h2>
            <p className="text-sm text-amber-800 mt-1">
              Resident's Level of Care (LOC) status is currently <span className="font-semibold">{locStatus}</span>. Care plan creation requires a <span className="font-bold underline">Confirmed</span> LOC classification.
            </p>
          </div>
        </div>
      </div>

      {/* Explanation Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Why is "Create Care Plan" blocked?
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          According to facility clinical governance (M2-US-02b), a Care Plan cannot be initiated until the Director of Nursing (DON) or authorized Nurse formally confirms the resident's Level of Care classification following their initial assessment.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-1">
          <div><span className="font-semibold text-slate-700">Resident:</span> {residentName}</div>
          <div><span className="font-semibold text-slate-700">Room:</span> {roomNumber || 'Unassigned'}</div>
          <div><span className="font-semibold text-slate-700">Current Status:</span> {locStatus}</div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <div className="text-xs text-slate-400">
            Tooltip: <span className="font-medium text-slate-600">"Confirm LOC classification first."</span>
          </div>
          <button
            type="button"
            onClick={handleGoToLOC}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
          >
            Go to LOC Classification
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
