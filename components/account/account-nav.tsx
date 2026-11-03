"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth";

const links = [
  ["/account", "Overview"],
  ["/account/orders", "Orders"],
  ["/account/machines", "My machines"],
  ["/account/tickets", "Tickets"],
  ["/account/documents", "Documents"],
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Account" className="flex flex-wrap gap-2">
        {links.map(([href, label]) => {
          const current = href === "/account" ? pathname === "/account" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={current ? "page" : undefined} className={cn("rounded-md px-3 py-2 text-sm font-semibold", current ? "bg-brand text-on-brand" : "bg-surface text-ink")}>
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="text-sm font-semibold text-accent"
        onClick={() => {
          signOut();
          router.push("/account/login");
        }}
      >
        Sign out{user ? ` (${user.name})` : ""}
      </button>
    </div>
  );
}
