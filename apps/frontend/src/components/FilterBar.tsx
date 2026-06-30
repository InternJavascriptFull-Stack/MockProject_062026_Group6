import { Calendar, Filter, Search, SlidersHorizontal, Plus } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  treatmentFilter: string;
  setTreatmentFilter: (treatment: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  treatmentFilter,
  setTreatmentFilter,
  statusFilter,
  setStatusFilter,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Selector */}
        <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-soft-gray transition shadow-sm">
          <Calendar className="h-4 w-4" />
          1 July - 20 July 2028
          <span className="ml-1 text-xs">▼</span>
        </button>

        {/* Treatment Dropdown */}
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-soft-gray transition shadow-sm">
          <Filter className="h-4 w-4" />
          <select
            value={treatmentFilter}
            onChange={(e) => setTreatmentFilter(e.target.value)}
            className="bg-transparent outline-none cursor-pointer"
          >
            <option value="">All Treatment</option>
            <option value="Routine Check-Up">Routine Check-Up</option>
            <option value="Cardiac Consultation">Cardiac Consultation</option>
            <option value="Pediatric Check-Up">Pediatric Check-Up</option>
            <option value="Skin Allergy">Skin Allergy</option>
            <option value="Follow-Up Visit">Follow-Up Visit</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-soft-gray transition shadow-sm">
          <Filter className="h-4 w-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="New Patient">New Patient</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">


        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-soft-gray">
  <Search className="h-4 w-4" />
</button>

<button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-soft-gray">
  <SlidersHorizontal className="h-4 w-4" />
</button>
        <button className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition shadow-md">
          <Plus className="h-4 w-4" />
          Add Patient
        </button>
      </div>
    </div>
  );
}
