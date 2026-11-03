import { cn } from "@/lib/utils/cn";

export function GradientHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 shadow-sm",
        className,
      )}
      style={{
        borderColor: "rgba(15, 118, 110, 0.18)",
        background: "linear-gradient(to right, rgba(15, 118, 110, 0.08), rgba(14, 165, 233, 0.08))",
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0f766e]">
            {eyebrow}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
        </div>
        {icon ? (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: "rgba(15, 118, 110, 0.08)", color: "#0f766e" }}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
    </div>
  );
}

export function DocumentSurface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[820px] rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MtButton({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
}) {
  const styles =
    variant === "primary"
      ? "bg-[#0f766e] text-white hover:bg-[#0d9488]"
      : variant === "outline"
        ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
        : variant === "danger"
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "text-slate-700 hover:bg-slate-100";
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition disabled:opacity-50",
        styles,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MtInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 sm:text-sm",
        props.className,
      )}
    />
  );
}

export function MtTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 sm:text-sm",
        props.className,
      )}
    />
  );
}

export function MtSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 sm:text-sm",
        props.className,
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ProgressStrip({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {steps.map((label, index) => {
        const active = index <= current;
        return (
          <div key={label} className="space-y-1">
            <div
              className="h-1.5 rounded-full"
              style={{
                background: active ? "#0f766e" : "rgba(15, 118, 110, 0.12)",
              }}
            />
            <p
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                active ? "text-[#0f766e]" : "text-slate-400",
              )}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
