import { site } from "@/lib/site";

export const metadata = { title: "My machines" };

export default function MachinesPage() {
  return (
    <div>
      <h1 className="text-3xl">My machines</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Installed equipment is listed here only after Microvision records it on this account.
      </p>
      <p className="mt-4 text-sm">
        Call <a className="font-semibold text-brand" href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>
        {" "}or{" "}
        <a className="font-semibold text-brand" href={site.whatsappUrl}>WhatsApp</a>.
      </p>
    </div>
  );
}
