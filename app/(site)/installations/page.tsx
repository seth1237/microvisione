import Link from "next/link";
import { liveInstallations } from "@/lib/api/live-catalogue";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata = {
  title: "Installations",
  description: "Equipment installations by Microvision Enterprises Ltd.",
};

export default async function InstallationsPage() {
  const items = await liveInstallations();

  return (
    <Container className="py-8">
      <PageIntro
        eyebrow="Projects"
        title="Installations"
        lede="Published installation records from the Microvision catalogue."
      />
      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No published installations yet.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item._id} className="rounded-md border border-line bg-surface p-4">
              <h2 className="text-lg font-semibold">
                <Link href={`/installations/${item.slug}`} className="hover:text-brand">
                  {item.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted">
                {[item.facility, item.location].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
