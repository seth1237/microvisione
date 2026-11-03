import Link from "next/link";
import { cn } from "@/lib/utils/cn";

function windowPages(page: number, pages: number): number[] {
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  const values: number[] = [];
  for (let current = Math.max(1, end - 4); current <= end; current += 1) values.push(current);
  return values;
}

export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;
  const items = windowPages(page, pages);
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold">
          Previous
        </Link>
      ) : null}
      {items.map((item) => (
        <Link
          key={item}
          href={hrefFor(item)}
          aria-current={item === page ? "page" : undefined}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold",
            item === page ? "border-brand bg-brand text-on-brand" : "border-line bg-surface",
          )}
        >
          {item}
        </Link>
      ))}
      {page < pages ? (
        <Link href={hrefFor(page + 1)} rel="next" className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
