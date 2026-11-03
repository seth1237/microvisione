import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  id,
  title,
  text,
  action,
  className,
}: {
  id?: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        <h2 id={id} className="text-2xl text-ink sm:text-3xl">{title}</h2>
        {text ? <p className="mt-2 text-muted">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}
