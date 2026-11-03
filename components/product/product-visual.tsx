import { cn } from "@/lib/utils/cn";

/** Neutral catalogue illustration. Not a photograph of the instrument. */
export function ProductVisual({
  name,
  variant = "primary",
  className,
}: {
  name: string;
  variant?: "primary" | "detail";
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <svg viewBox="0 0 640 480" className={cn("h-full w-full", className)} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <rect width="640" height="480" fill="#FFFFFF" />
      <rect x="78" y="64" width="484" height="352" rx="18" className="fill-surface stroke-brand" strokeWidth="3" />
      <rect x="118" y="112" width="250" height="210" rx="14" className="fill-brand-soft stroke-brand" strokeWidth="2" />
      <rect
        x="392"
        y="128"
        width="128"
        height="178"
        rx="10"
        className={variant === "detail" ? "fill-accent" : "fill-brand"}
      />
      <circle cx="456" cy="176" r="18" className="fill-surface" />
      <text
        x="243"
        y="232"
        textAnchor="middle"
        className="fill-brand"
        fontFamily="inherit"
        fontSize="48"
        fontWeight="700"
      >
        {initials}
      </text>
      <text
        x="456"
        y="268"
        textAnchor="middle"
        className="fill-on-brand"
        fontFamily="inherit"
        fontSize="16"
        fontWeight="700"
      >
        {variant === "detail" ? "ALT" : "CAT"}
      </text>
      <rect x="118" y="346" width="402" height="10" rx="5" className="fill-paper-deep" />
    </svg>
  );
}
