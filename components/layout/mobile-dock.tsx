"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SearchBox } from "@/components/layout/search-box";
import { cn } from "@/lib/utils/cn";
import { cartCount, useCartStore } from "@/store/cart";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/products", label: "Categories", icon: LayoutGrid },
] as const;

export function MobileDock() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const count = cartCount(cartItems);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Mobile">
        <ul className="grid grid-cols-5">
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
          <li>
            <button type="button" className="flex w-full flex-col items-center gap-1 py-2 text-[11px] font-semibold text-muted" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" aria-hidden="true" />
              Search
            </button>
          </li>
          <li>
            <Link href="/cart" data-cart-target="" aria-current={pathname.startsWith("/cart") ? "page" : undefined} className={cn("relative flex flex-col items-center gap-1 py-2 text-[11px] font-semibold", pathname.startsWith("/cart") ? "text-brand" : "text-muted")}>
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              Cart
              {count > 0 ? <span className="absolute top-1 right-4 rounded-full bg-accent px-1 text-[10px] text-on-accent">{count}</span> : null}
            </Link>
          </li>
          <li>
            <Link href="/account" aria-current={pathname.startsWith("/account") ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2 text-[11px] font-semibold", pathname.startsWith("/account") ? "text-brand" : "text-muted")}>
              <User className="h-5 w-5" aria-hidden="true" />
              Account
            </Link>
          </li>
        </ul>
      </nav>
      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed inset-x-3 bottom-20 z-50 rounded-md bg-surface p-4 shadow-pop">
            <Dialog.Title className="text-base">Search</Dialog.Title>
            <Dialog.Description className="sr-only">Search the product catalogue</Dialog.Description>
            <div className="mt-3">
              <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
