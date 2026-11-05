import Link from "next/link";
import { site } from "@/lib/site";
import type { CategoryWithCount } from "@/types";

export function SiteFooter({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <footer className="border-t border-line bg-black text-on-dark">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg">Microvision Enterprises Ltd</p>
          <p className="mt-3 text-sm text-on-dark/80">{site.positioning}</p>
          <address className="mt-4 text-sm not-italic">
            {site.address.line1}
            <br />
            {site.address.locality}
          </address>
          <p className="mt-3 text-sm">
            <a href={`tel:${site.phoneTel}`} className="font-semibold">{site.phoneDisplay}</a>
          </p>
          <p className="mt-1 text-sm">
            <a href={site.whatsappUrl} className="font-semibold" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            {site.emailIsPlaceholder ? <span className="block text-xs text-on-dark/70">Placeholder email — confirm before publishing.</span> : null}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["/about", "About"],
              ["/gallery", "Gallery"],
              ["/brands", "Manufacturers"],
              ["/services", "Biomedical and after-sales"],
              ["/events", "Events and activities"],
              ["/careers", "Careers"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:underline">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Equipment</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`} className="hover:underline">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Hours</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {site.hours.map((row) => (
              <li key={row.label}>
                <span className="text-on-dark/70">{row.label}: </span>
                {row.value}
              </li>
            ))}
          </ul>
          {site.hoursArePlaceholder ? (
            <p className="mt-2 text-xs text-on-dark/70">Example hours — confirm before publishing.</p>
          ) : null}
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/legal/terms" className="hover:underline">Terms</Link></li>
            <li><Link href="/legal/privacy" className="hover:underline">Privacy</Link></li>
          </ul>
          <p className="mt-4 text-xs text-on-dark/70">Social profiles are not linked until the official accounts are confirmed.</p>
        </div>
      </div>
      <div className="border-t border-on-dark/15">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-xs text-on-dark/70">
            © {site.catalogueAsOf.slice(0, 4)} Microvision Enterprises Ltd. Catalogue illustrations are placeholders.
          </p>
          <a href="https://codewithseth.co.ke" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-on-dark/80 hover:text-white">
            <img src="/brand/smo.jpg" alt="" className="h-6 w-6 rounded-full bg-white object-cover" />
            Built by codewithseth.co.ke
          </a>
        </div>
      </div>
    </footer>
  );
}
