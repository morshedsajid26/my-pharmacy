import { cn } from "../utils/cn";

export function Card({
  className,
  title,
  subtitle,
  footer,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/85 flex flex-col",
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-slate-100">
          {title && (
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-4 flex-1">{children}</div>
      {footer && (
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-xl text-xs">
          {footer}
        </div>
      )}
    </div>
  );
}
