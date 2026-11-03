import { cn } from "@/lib/utils/cn";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "accent";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-paper-deep text-ink",
    brand: "bg-brand-soft text-brand-deep",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    accent: "bg-accent text-on-accent",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
