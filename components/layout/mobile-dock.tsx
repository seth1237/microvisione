"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/account", label: "Account", icon: User },
] as const;

export function MobileDock() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Mobile">
      <ul className="grid grid-cols-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={current ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2 text-[11px] font-semibold", current ? "text-brand" : "text-muted")}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
