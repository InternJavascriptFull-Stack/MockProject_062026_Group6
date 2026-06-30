import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  // Simple logic to show a few page numbers
  const pages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-between pb-4">
      <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
        Showing 
        <div className="relative flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1">
          <span className="text-navy">{itemsPerPage}</span>
          <span className="ml-2 text-xs">▼</span>
        </div>
        out of {totalItems}
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft-gray text-gray-400 hover:bg-gray-200 disabled:opacity-50 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition",
              currentPage === page 
                ? "bg-navy text-white"
                : "bg-soft-gray text-gray-500 hover:bg-gray-200"
            )}
          >
            {page}
          </button>
        ))}

        {totalPages > 3 && (
          <>
            <span className="text-gray-400 px-1">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition",
                currentPage === totalPages 
                  ? "bg-navy text-white"
                  : "bg-soft-gray text-gray-500 hover:bg-gray-200"
              )}
            >
              {totalPages}
            </button>
          </>
        )}

        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft-gray text-gray-400 hover:bg-gray-200 disabled:opacity-50 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
