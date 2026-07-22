import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import type { CreateHolidayPayload, StateHoliday } from '../../services/holidays';

interface AddEditStateHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateHolidayPayload) => Promise<void>;
  holidayToEdit?: StateHoliday | null;
}

export const AddEditStateHolidayModal: React.FC<AddEditStateHolidayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  holidayToEdit,
}) => {
  const [name, setName] = useState('');
  const [dateType, setDateType] = useState<'FIXED' | 'FLOATING'>('FIXED');
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const [floatingRule, setFloatingRule] = useState('');
  const [repeatsAnnually, setRepeatsAnnually] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (holidayToEdit) {
      setName(holidayToEdit.name || '');
      setDateType((holidayToEdit.dateType as 'FIXED' | 'FLOATING') || 'FIXED');
      setMonth(holidayToEdit.month || 1);
      setDay(holidayToEdit.day || 1);
      setFloatingRule(holidayToEdit.floatingRule || '');
      setRepeatsAnnually(holidayToEdit.repeatsAnnually ?? true);
    } else {
      setName('');
      setDateType('FIXED');
      setMonth(1);
      setDay(1);
      setFloatingRule('');
      setRepeatsAnnually(true);
    }
    setError(null);
  }, [holidayToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Holiday Name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        name: name.trim(),
        dateType,
        month: dateType === 'FIXED' ? Number(month) : undefined,
        day: dateType === 'FIXED' ? Number(day) : undefined,
        floatingRule: dateType === 'FLOATING' ? floatingRule.trim() : undefined,
        repeatsAnnually,
      });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save State Holiday';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-800">
              {holidayToEdit ? 'Edit State Holiday' : 'Add State Holiday'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Holiday Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Holiday Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. César Chávez Day"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Date Type Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDateType('FIXED')}
                className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  dateType === 'FIXED'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Fixed Calendar Date
              </button>
              <button
                type="button"
                onClick={() => setDateType('FLOATING')}
                className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  dateType === 'FLOATING'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Floating Rule
              </button>
            </div>
          </div>

          {/* Fixed Date Fields */}
          {dateType === 'FIXED' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            /* Floating Rule Field */
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Floating Rule Description
              </label>
              <input
                type="text"
                value={floatingRule}
                onChange={(e) => setFloatingRule(e.target.value)}
                placeholder="e.g. 4th Friday in September"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Repeats Annually */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="repeatsAnnually"
              checked={repeatsAnnually}
              onChange={(e) => setRepeatsAnnually(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="repeatsAnnually" className="text-sm text-slate-700 cursor-pointer">
              Repeats every year
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? 'Saving...'
                : holidayToEdit
                ? 'Save Changes'
                : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
