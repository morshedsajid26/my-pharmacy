"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - Currently active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when a page number or prev/next is clicked
 * @param {number} totalItems - Total count of records (optional)
 * @param {number} itemsPerPage - Number of records per page (optional)
 * @param {string} itemName - Label for records (e.g. "medicines", "orders", "items")
 * @param {string} className - Additional CSS classes for wrapper
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = "items",
  className = "",
}) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  // Helper to generate page numbers with ellipsis if many pages
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-slate-200 ${className}`}
    >
      {/* Items Range Info */}
      {totalItems !== undefined ? (
        <span className="text-xs font-bold text-slate-500">
          Showing{" "}
          <span className="text-slate-800 font-extrabold">{startItem}</span>{" "}
          to{" "}
          <span className="text-slate-800 font-extrabold">{endItem}</span>{" "}
          of{" "}
          <span className="text-slate-800 font-extrabold">{totalItems}</span>{" "}
          {itemName}
        </span>
      ) : (
        <span className="text-xs font-bold text-slate-500">
          Page <span className="text-slate-800 font-extrabold">{currentPage}</span> of{" "}
          <span className="text-slate-800 font-extrabold">{totalPages}</span>
        </span>
      )}

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer flex items-center justify-center min-w-10 min-h-10 disabled:cursor-not-allowed shadow-sm"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-10 h-10 flex items-center justify-center text-xs font-extrabold text-slate-400 select-none"
              >
                ...
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange && onPageChange(p)}
              className={`w-10 h-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? "bg-medical-blue-600 hover:bg-medical-blue-700 text-white shadow-md shadow-medical-blue-600/10 scale-105"
                  : "bg-white border border-slate-200 hover:border-slate-400 text-slate-600 shadow-sm"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer flex items-center justify-center min-w-10 min-h-10 disabled:cursor-not-allowed shadow-sm"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;

