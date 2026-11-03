"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { mtFetch } from "@/lib/medtrack/client";

const nav = [
  { href: "/medtrack", label: "Today", icon: LayoutDashboard },
  { href: "/medtrack/equipment", label: "Machines", icon: QrCode },
  { href: "/medtrack/tickets", label: "Tickets", icon: ClipboardList },
  { href: "/medtrack/schedules", label: "Plan", icon: CalendarClock },
  { href: "/medtrack/reports", label: "Reports", icon: Activity },
];

export function MedTrackShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hospitalName, setHospitalName] = useState("MedTrack");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    mtFetch<{
      user: { name: string; role: string };
      hospital: { name: string } | null;
    }>("/auth/me").then((res) => {
      if (!res.ok) {
        router.replace("/medtrack/login");
        return;
      }
      setHospitalName(res.data?.hospital?.name || "MedTrack");
      setUserName(res.data?.user.name || "");
      setRole(res.data?.user.role || "");
    });
  }, [router]);

  async function logout() {
    await mtFetch("/auth/logout", { method: "POST" });
    router.replace("/medtrack/login");
  }

  return (
    <div className="medtrack-root flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0f766e]">
              MedTrack QR
            </p>
            <p className="truncate text-sm font-semibold">{hospitalName}</p>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => {
            const active =
              item.href === "/medtrack"
                ? pathname === "/medtrack"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium",
                  active ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/medtrack/equipment/new"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-10 items-center gap-2 rounded-md bg-[#0f766e] px-3 text-sm font-semibold text-white"
          >
            <Wrench className="h-4 w-4" />
            Register equipment
          </Link>
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 p-3">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="text-xs capitalize text-slate-500">{role}</p>
          <button
            onClick={logout}
            className="mt-2 flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {open ? (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center gap-3 border-b border-slate-200 bg-white px-3 lg:h-14 lg:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-slate-800">Field operations</p>
        </header>
        <main className="flex-1 overflow-y-auto p-3 pb-24 sm:p-4 lg:p-6 lg:pb-6">
          <div className="mx-auto max-w-[1400px] space-y-4">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {nav.map((item) => {
          const active =
            item.href === "/medtrack"
              ? pathname === "/medtrack"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                active ? "text-[#0f766e]" : "text-slate-500",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
