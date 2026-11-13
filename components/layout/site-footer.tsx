import Link from "next/link";
import { SOCIAL_LINKS, type SocialId } from "@/lib/platform/socials";
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
          <nav aria-label="Social media" className="mt-5 flex items-center gap-2">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                aria-label={item.label}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-on-dark/25 text-on-dark transition hover:border-on-dark hover:bg-on-dark hover:text-black"
              >
                <SocialIcon id={item.id} />
              </a>
            ))}
          </nav>
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

function SocialIcon({ id }: { id: SocialId }) {
  const common = { viewBox: "0 0 24 24", className: "h-[18px] w-[18px]", "aria-hidden": true as const };
  if (id === "instagram") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.75" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M14.2 8.5h2.3V5.8h-2.3c-2.1 0-3.7 1.7-3.7 3.8v1.7H8.2v2.7h2.3V20h2.8v-6h2.4l.4-2.7h-2.8V9.6c0-.6.4-1.1 1.1-1.1z" />
      </svg>
    );
  }
  if (id === "linkedin") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M6.2 9.2H3.8V19h2.4V9.2zM5 4.8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM20.2 13.2c0-2.5-1.3-4.1-3.6-4.1-1.4 0-2.2.7-2.7 1.5V9.2H11.5V19h2.4v-5.4c0-.4 0-.7.1-1 .3-.7.9-1.4 1.9-1.4 1.3 0 1.9 1 1.9 2.4V19h2.4v-5.8z" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="currentColor">
      <path d="M14.2 4.2c.5 1.5 1.6 2.6 3.1 3.1v2.4a6.2 6.2 0 0 1-3.1-1v5.6a5.1 5.1 0 1 1-5.1-5.1c.3 0 .6 0 .9.1v2.5a2.6 2.6 0 1 0 1.8 2.5V4.2h2.4z" />
    </svg>
  );
}
