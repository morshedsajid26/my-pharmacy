import { cn } from "../utils/cn";

export function Table({ headers, children, className }) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-slate-100", className)}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        "hover:bg-slate-50/50 transition-colors", 
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className }) {
  return (
    <td className={cn("px-6 py-4 text-sm text-slate-600 align-middle", className)}>
      {children}
    </td>
  );
}
