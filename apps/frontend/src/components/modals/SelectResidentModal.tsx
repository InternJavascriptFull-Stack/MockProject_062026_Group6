import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, User, AlertCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export interface ResidentSummaryItem {
  id: string;
  firstName: string;
  lastName: string;
  roomNumber?: string;
  careLevelName?: string;
  carePlanStatus?: string;
}

interface SelectResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: ResidentSummaryItem[];
}

export const SelectResidentModal: React.FC<SelectResidentModalProps> = ({
  isOpen,
  onClose,
  residents,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredResidents = residents.filter((r) => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const room = (r.roomNumber || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || room.includes(query);
  });

  const handleContinue = async () => {
    if (!selectedId) return;
    try {
      setIsChecking(true);
      setNotice(null);
      const res = await apiClient.get(`/care-plans/check-active/${selectedId}`);
      const data = res.data?.data;

      if (data?.hasActiveOrDraft && data?.existingPlan) {
        setNotice(`An existing Care Plan (${data.existingPlan.status}) was found for this resident. Opening existing plan...`);
        setTimeout(() => {
          onClose();
          navigate(`/care-plans/${data.existingPlan.id}`);
        }, 1200);
      } else {
        onClose();
        navigate(`/care-plans/new?residentId=${selectedId}`);
      }
    } catch (err) {
      // Fallback direct navigate if API fails
      onClose();
      navigate(`/care-plans/new?residentId=${selectedId}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">Select Resident for New Care Plan</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by resident name or room number..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>{notice}</div>
          </div>
        )}

        {/* Resident Table */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredResidents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No matching residents found.</div>
          ) : (
            filteredResidents.map((r) => {
              const isSelected = selectedId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="selectedResident"
                      checked={isSelected}
                      onChange={() => setSelectedId(r.id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {r.firstName} {r.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        Room: {r.roomNumber || 'Unassigned'} • LOC: {r.careLevelName || 'Tier 2'}
                      </div>
                    </div>
                  </div>
                  <div>
                    {r.carePlanStatus ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {r.carePlanStatus}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        No active plan
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedId || isChecking}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs disabled:opacity-50 transition-colors"
          >
            {isChecking ? 'Checking...' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
