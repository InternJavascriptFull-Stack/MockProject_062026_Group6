import { useState, useMemo } from "react";
import { FilterBar } from "../components/FilterBar";
import { PatientTable } from "../components/PatientTable";
import { Pagination } from "../components/Pagination";
import { mockPatients } from "../data/patients";
import type { Patient } from "../types/patient";

export function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [treatmentFilter, setTreatmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Patient | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const handleSort = (field: keyof Patient) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedPatients = useMemo(() => {
    let result = [...mockPatients];

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.doctor.toLowerCase().includes(q) ||
          p.treatment.toLowerCase().includes(q)
      );
    }

    // Filter by treatment
    if (treatmentFilter) {
      result = result.filter((p) => p.treatment === treatmentFilter);
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        
        if (valA! < valB!) return sortOrder === "asc" ? -1 : 1;
        if (valA! > valB!) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchQuery, treatmentFilter, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage) || 1;
  const paginatedPatients = filteredAndSortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl">
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        treatmentFilter={treatmentFilter}
        setTreatmentFilter={setTreatmentFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <PatientTable 
        patients={paginatedPatients} 
        onSort={handleSort}
      />
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={paginatedPatients.length}
        totalItems={filteredAndSortedPatients.length}
      />
    </div>
  );
}
