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
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export const TableRow = ({ children, className = "", ...props }) => (
  <tr
    className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = "", ...props }) => (
  <td
    className={`py-3.5 text-center px-4 text-sm font-normal text-slate-700 ${className}`}
    {...props}
  >
    {children}
  </td>
);

export function Table({
  TableHeads,
  TableRows,
  headClass,
  tableClass,
  wrapperClass = "overflow-x-auto",
  children,
  headers,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);

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

          if (value && typeof value === "object") {
            if (typeof value.getMonth === "function") {
              return new Date(value).toLocaleDateString();
            }
            return JSON.stringify(value);
          }

          return value;
        },
        size: typeof head.width === "number" ? head.width : 150,
        width: head.width,
        enableSorting: head.sortable !== false,
      })),
    [TableHeads]
  );

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
      <div
        className={`${wrapperClass} rounded-xl border border-slate-200/85 bg-white hide-scrollbar`}
      >
        <table className={`w-full min-w-[800px] border-collapse ${tableClass}`}>
          {headers && (
            <thead>
              <tr className="border-b border-slate-200/85 bg-slate-50/90">
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={`text-center font-semibold text-slate-600 py-3.5 px-4 text-xs uppercase tracking-wider ${headClass}`}
                  >
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
    <div className="space-y-3">
      <div
        className={`${wrapperClass} rounded-xl border border-slate-200/85 bg-white hide-scrollbar`}
      >
        <table className={`w-full min-w-[800px] border-collapse ${tableClass}`}>
          {/* ==== TABLE HEADER ==== */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-200/85 bg-slate-50/90"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-center font-semibold text-slate-600 py-3.5 px-4 text-xs uppercase tracking-wider ${headClass} select-none`}
                    style={{
                      width:
                        header.column.columnDef.width ||
                        header.column.columnDef.size,
                    }}
                  >
                    <div
                      className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors"
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
                            asc: (
                              <ArrowUp
                                size={13}
                                className="text-medical-blue-600"
                              />
                            ),
                            desc: (
                              <ArrowDown
                                size={13}
                                className="text-medical-blue-600"
                              />
                            ),
                          }[header.column.getIsSorted()] ?? (
                            <ArrowUpDown size={13} />
                          )}
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
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="py-3.5 text-center px-4 text-sm font-normal text-slate-700"
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
      <div className="flex items-center justify-between px-5 py-3 bg-white border border-slate-200/85 rounded-xl">
        <div className="text-xs text-slate-500 font-medium">
          Page{" "}
          <span className="font-mono font-bold text-slate-900">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          of{" "}
          <span className="font-mono font-bold text-slate-900">
            {table.getPageCount()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {table.getPageOptions().map((pageIdx) => (
              <button
                key={pageIdx}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-colors ${
                  table.getState().pagination.pageIndex === pageIdx
                    ? "bg-medical-blue-600 text-white"
                    : "bg-white text-slate-600 border border-transparent hover:border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => table.setPageIndex(pageIdx)}
              >
                {pageIdx + 1}
              </button>
            ))}
          </div>

          <button
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
