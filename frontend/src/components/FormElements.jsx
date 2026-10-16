import { cn } from "../utils/cn";

export function Input({ label, error, className, ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-blue-500/20 focus:border-medical-blue-500 disabled:opacity-50 disabled:bg-slate-50",
          error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options = [], className, ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-medical-blue-500/20 focus:border-medical-blue-500 disabled:opacity-50 disabled:bg-slate-50 appearance-none",
          error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
          className
        )}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
