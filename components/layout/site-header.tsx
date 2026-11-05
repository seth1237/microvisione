"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronDown,
  Heart,
  Menu,
  MessageCircle,
  Phone,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { SearchBox } from "@/components/layout/search-box";
import "@/components/layout/site-header.module.css";
import { useCatalogue } from "@/components/providers/catalogue-provider";
import { Logo } from "@/components/layout/logo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { formatKes } from "@/lib/utils/format";
import { cartCount, cartTotal, useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { categories } = useCatalogue();
  const [companyOpen, setCompanyOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [clipNav, setClipNav] = useState(false);
  const compactRef = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const [spacer, setSpacer] = useState(148);
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setCompanyOpen(false);
  }
  const items = useCartStore((state) => state.items);
  const wishes = useWishlistStore((state) => state.ids.length);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCompanyOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (compact) return;
    const timer = window.setTimeout(() => {
      setClipNav(false);
      const header = headerRef.current;
      if (!header || !window.matchMedia("(min-width: 1024px)").matches) return;
      const height = header.offsetHeight;
      if (height > 80) setSpacer(height);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [compact]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    let lastY = window.scrollY;
    let accum = 0;
    let frame = 0;
    let hold = 0;

    const apply = (next: boolean) => {
      if (compactRef.current === next) return;
      compactRef.current = next;
      setCompact(next);
      hold = performance.now() + 320;
      if (next) {
        setCompanyOpen(false);
        setClipNav(true);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY;
        lastY = y;
        if (!desktop.matches || y < 48) {
          accum = 0;
          apply(false);
          return;
        }
        if (performance.now() < hold || Math.abs(delta) < 1) return;
        accum = delta > 0 ? Math.max(0, accum) + delta : Math.min(0, accum) + delta;
        if (accum > 36) {
          apply(true);
          accum = 0;
        } else if (accum < -36) {
          apply(false);
          accum = 0;
        }
      });
    };

    const onDesktop = () => {
      if (!desktop.matches) apply(false);
    };

    desktop.addEventListener("change", onDesktop);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      desktop.removeEventListener("change", onDesktop);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
    <header ref={headerRef} className={cn("mv-nav-host sticky top-0 z-40 lg:fixed lg:inset-x-0", compact && "mv-nav-island")}>
      <div className="mv-nav-fold grid">
      <div>
      <div className="bg-black/80 text-on-dark backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6">
          <p className="hidden sm:block">Medical and laboratory equipment · Nairobi</p>
          <div className="flex items-center gap-4">
            <a href={`tel:${site.phoneTel}`} className="inline-flex items-center gap-1 font-semibold">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {site.phoneDisplay}
            </a>
            <a href={site.whatsappUrl} className="inline-flex items-center gap-1 font-semibold" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              WhatsApp
            </a>
            <a href={`mailto:${site.email}`} className="hidden md:inline">
              {site.email}
            </a>
          </div>
        </div>
      </div>
      </div>
      </div>

      <div className="glass-nav mv-nav-bar border-b border-white/50">
      <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-2 px-2 py-2 sm:px-6 lg:px-8">
        <Dialog.Root>
          <Dialog.Trigger className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Content className="glass fixed inset-y-0 left-0 z-50 flex w-[min(100%,22rem)] flex-col">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <Dialog.Title className="text-base">Menu</Dialog.Title>
                <Dialog.Close className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line" aria-label="Close menu">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">Site sections and product categories</Dialog.Description>
              <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Categories</p>
                <ul className="mt-2 space-y-1">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Dialog.Close asChild>
                        <Link href={`/category/${category.slug}`} className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-semibold">
                          {category.name}
                          <span className="text-muted">{category.count}</span>
                        </Link>
                      </Dialog.Close>
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm font-semibold">
                  {[
                    ["/brands", "Brands"],
                    ["/services", "Services"],
                    ["/about", "About"],
                    ["/gallery", "Gallery"],
                    ["/events", "Events"],
                    ["/careers", "Careers"],
                    ["/contact", "Contact"],
                    ["/account", "Account"],
                    ["/wishlist", "Wishlist"],
                    ["/compare", "Compare"],
                    ["/quote", "Quote basket"],
                    ["/cart", "Cart"],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <Dialog.Close asChild>
                        <Link href={href} className="block rounded-md px-2 py-2">
                          {label}
                        </Link>
                      </Dialog.Close>
                    </li>
                  ))}
                </ul>
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Link href="/" className="h-[47px] w-[200px] shrink-0" aria-label="Microvision home">
          <Logo />
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center lg:flex lg:px-14">
          <div className="w-full max-w-xl">
            <SearchBox />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0 lg:gap-3">
          <Link href="/quote" className="hidden h-11 items-center rounded-md bg-accent px-3 text-sm font-semibold text-on-accent lg:inline-flex">
            Request quote
          </Link>
          <IconLink href="/account" label="Account" current={pathname.startsWith("/account")} className="hidden sm:inline-flex">
            <User className="h-4 w-4" aria-hidden="true" />
          </IconLink>
          <IconLink href="/wishlist" label="Wishlist" count={wishes} current={pathname === "/wishlist"} className="hidden sm:inline-flex">
            <Heart className="h-4 w-4" aria-hidden="true" />
          </IconLink>
          <IconLink href="/cart" label={items.length ? `Cart, ${formatKes(cartTotal(items))}` : "Cart"} count={cartCount(items)} current={pathname.startsWith("/cart") || pathname.startsWith("/checkout")} cartTarget>
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {items.length > 0 ? <span className="hidden text-xs font-semibold xl:inline">{formatKes(cartTotal(items))}</span> : null}
          </IconLink>
        </div>
      </div>

      <div className="px-3 pb-3 lg:hidden">
        <SearchBox
          listId="header-search-list-phone"
          placeholder="Search"
          inputClassName="rounded-full border-transparent bg-paper pl-10"
          menuClassName="rounded-2xl shadow-none"
        />
      </div>

      <div className="mv-nav-fold hidden lg:grid">
        <div className={clipNav ? "overflow-hidden" : undefined}>
          <nav className="border-t border-white/40" aria-label="Primary" aria-hidden={compact}>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8">
              <NavLink href="/brands" current={pathname.startsWith("/brands")}>Brands</NavLink>
              <NavLink href="/services" current={pathname.startsWith("/services")}>Services</NavLink>
              <div
                className="relative"
                onMouseEnter={() => {
                  if (compactRef.current) return;
                  setClipNav(false);
                  setCompanyOpen(true);
                }}
                onMouseLeave={() => setCompanyOpen(false)}
              >
                <button type="button" className="inline-flex h-12 items-center gap-1 px-3 text-sm font-semibold" aria-expanded={companyOpen} tabIndex={compact ? -1 : undefined}>
                  Company
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
                {companyOpen ? (
                  <ul className="glass absolute top-full right-0 z-40 min-w-44 rounded-md p-2">
                    {companyLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-paper">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </nav>
        </div>
      </div>
      </div>
    </header>
    <div className="hidden lg:block" style={{ height: spacer }} aria-hidden="true" />
    </>
  );
}

function NavLink({ href, current, children }: { href: string; current?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={current ? "page" : undefined} className={cn("inline-flex h-12 items-center px-3 text-sm font-semibold", current && "text-brand")}>
      {children}
    </Link>
  );
}

function IconLink({
  href,
  label,
  count,
  current,
  className,
  cartTarget,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  current?: boolean;
  className?: string;
  cartTarget?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      data-cart-target={cartTarget ? "" : undefined}
      aria-label={count ? `${label}, ${count}` : label}
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative inline-flex h-11 items-center gap-1 rounded-md border border-line px-2.5 text-ink",
        current && "border-brand text-brand",
        className,
      )}
    >
      {children}
      {count ? (
        <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
