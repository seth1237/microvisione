import { site } from "@/lib/site";

export const metadata = { title: "Tickets" };

export default function TicketsPage() {
  return (
    <div>
      <h1 className="text-3xl">Tickets</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Service requests are not listed on this page yet. Contact Microvision and the team will follow up.
      </p>
      <p className="mt-4 text-sm">
        Call <a className="font-semibold text-brand" href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>
        {" "}or{" "}
        <a className="font-semibold text-brand" href={site.whatsappUrl}>WhatsApp</a>
        {" "}or email{" "}
        <a className="font-semibold text-brand" href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </div>
  );
}
