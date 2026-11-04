"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { sessionId, visitorId } from "@/lib/analytics/shop";
import { useCatalogue } from "@/components/providers/catalogue-provider";
import { cn } from "@/lib/utils/cn";

export function SearchBox({ autoFocus = false, onNavigate }: { autoFocus?: boolean; onNavigate?: () => void }) {
  const { searchIndex } = useCatalogue();
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = "header-search-list";

  const matches = useMemo(() => {
    const query = term.trim().toLowerCase();
    if (!query) return [];
    return searchIndex
      .filter((item) => `${item.name} ${item.brand} ${item.category}`.toLowerCase().includes(query))
      .slice(0, 6);
  }, [searchIndex, term]);

  function recordSearch(trigger: "submit" | "result" | "blur") {
    const query = term.trim();
    if (query.length < 2) return;
    void fetch("/api/analytics/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        query,
        resultCount: matches.length,
        trigger,
        path: window.location.pathname,
        visitorId: visitorId(),
        sessionId: sessionId(),
        productId: matches[active]?.id || "",
      }),
    }).catch(() => undefined);
  }

  function go(href: string) {
    recordSearch("result");
    setOpen(false);
    setTerm("");
    onNavigate?.();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) setOpen(true);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(matches.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const picked = matches[active];
      if (picked && term.trim()) go(`/product/${picked.slug}`);
    }
  }

  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">Search products</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `search-opt-${matches[active].id}` : undefined}
          value={term}
          autoFocus={autoFocus}
          placeholder="Search analyzers, meters, brands"
          className="h-11 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-base"
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => recordSearch("blur")}
          onKeyDown={onKeyDown}
        />
      </label>
      {open && term.trim() ? (
        <ul id={listId} role="listbox" className="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-pop">
          {matches.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">No matching products</li>
          ) : (
            matches.map((item, index) => (
              <li key={item.id} id={`search-opt-${item.id}`} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  className={cn("block w-full px-3 py-2 text-left", index === active && "bg-brand-soft")}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(`/product/${item.slug}`)}
                >
                  <span className="block text-sm font-semibold">{item.name}</span>
                  <span className="text-xs text-muted">{item.brand} · {item.category}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
