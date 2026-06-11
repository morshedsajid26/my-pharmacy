"use client";
import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Search } from "lucide-react";

export const TableRow = ({ children, className = "", ...props }) => (
  <tr className={`hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0 group ${className}`} {...props}>
    {children}
  </tr>
);

export const TableCell = ({ children, className = "", ...props }) => (
  <td className={`py-4 text-center px-4 text-sm font-normal text-slate-600 group-hover:text-medical-blue-600 transition-colors ${className}`} {...props}>
    {children}
  </td>
);

export function Table({ TableHeads, TableRows, headClass, tableClass, children, headers }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);

  // 1. Transform user's TableHeads into TanStack columns
  const columns = React.useMemo(
    () =>
      (TableHeads || []).map((head) => ({
        accessorKey: head.key,
        header: head.Title,
        cell: (info) => {
          if (head.render) {
            return head.render(info.row.original, info.row.index);
          }
          const value = info.getValue();
          
          if (value instanceof Date) {
            return value.toLocaleDateString();
          }
          
          if (value && typeof value === 'object') {
            // Check if it's a date-like object
            if (typeof value.getMonth === 'function') {
              return new Date(value).toLocaleDateString();
            }
            return JSON.stringify(value);
          }
          
          return value;
        },
        size: typeof head.width === 'number' ? head.width : 150,
        width: head.width,
        enableSorting: head.sortable !== false,
      })),
    [TableHeads]
  );

  // 2. Initialize the table
  const table = useReactTable({
    data: TableRows || [],
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (children) {
    return (
      <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className={`w-full border-collapse ${tableClass}`}>
          {headers && (
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className={`text-center bg-slate-900 font-semibold text-white py-4 px-4 text-xs uppercase tracking-wider ${headClass}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-arimo">
      {/* ==== GLOBAL FILTER (SEARCH) ==== */}
      {/* ... omitted for brevity ... */}

      <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className={`w-full border-collapse ${tableClass}`}>
          {/* ==== TABLE HEADER ==== */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-center bg-slate-900 font-semibold text-white py-4 px-4 text-xs uppercase tracking-wider ${headClass} select-none`}
                    style={{ width: header.column.columnDef.width || header.column.columnDef.size }}
                  >
                    <div 
                      className="flex items-center justify-center gap-2 cursor-pointer hover:text-medical-blue-200 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      
                      {header.column.getCanSort() && (
                        <span className="text-slate-400">
                          {{
                            asc: <ArrowUp size={14} className="text-medical-blue-300" />,
                            desc: <ArrowDown size={14} className="text-medical-blue-300" />,
                          }[header.column.getIsSorted()] ?? <ArrowUpDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* ==== TABLE BODY ==== */}
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-all group">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="py-4 text-center px-4 text-sm font-normal text-slate-600 group-hover:text-medical-blue-600 transition-colors"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==== PAGINATION CONTROLS ==== */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="text-sm text-slate-500 font-medium">
          Page <span className="font-bold text-slate-900">{table.getState().pagination.pageIndex + 1}</span> of{" "}
          <span className="font-bold text-slate-900">{table.getPageCount()}</span>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-medical-blue-50 hover:text-medical-blue-600 hover:border-medical-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-1">
                {table.getPageOptions().map((pageIdx) => (
                    <button
                        key={pageIdx}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                            table.getState().pagination.pageIndex === pageIdx
                                ? "bg-medical-blue-600 text-white shadow-md shadow-medical-blue-600/20"
                                : "bg-white text-slate-600 border border-transparent hover:border-slate-200 hover:bg-slate-50"
                        }`}
                        onClick={() => table.setPageIndex(pageIdx)}
                    >
                        {pageIdx + 1}
                    </button>
                ))}
            </div>

            <button
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-medical-blue-50 hover:text-medical-blue-600 hover:border-medical-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                <ChevronRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}
