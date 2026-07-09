import { useState } from 'react';
import { PatientBanner } from './components/patientBanner';
import { EmarControls } from './components/emarControls';
import { MedicationTable } from './components/medicationTable';

export const EmarPage = () => {
  const [currentDate] = useState(new Date().toLocaleDateString('vi-VN'));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-800">eMAR Management</h1>
      </div>
      
      <PatientBanner />
      <EmarControls currentDate={currentDate} />
      <MedicationTable />
      
    </div>
  );
};
