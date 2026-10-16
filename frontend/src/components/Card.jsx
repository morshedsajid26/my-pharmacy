import { cn } from "../utils/cn";

export function Card({ className, title, subtitle, footer, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-50">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-3 flex-1">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 rounded-b-xl text-sm">
          {footer}
        </div>
      )}
    </div>
  );
}
