import { notFound } from "next/navigation";
import { liveInstallation } from "@/lib/api/live-catalogue";
import { Container } from "@/components/ui/container";

export default async function InstallationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await liveInstallation(slug);
  if (!item || item.published === false) notFound();

  return (
    <Container className="py-8">
      <p className="text-sm font-semibold text-brand">Installation</p>
      <h1 className="mt-2 text-3xl">{item.title}</h1>
      <p className="mt-2 text-sm text-muted">{[item.facility, item.location].filter(Boolean).join(" · ")}</p>
      {item.cover?.secureUrl ? (
        <img src={item.cover.secureUrl} alt="" className="mt-6 max-h-96 w-full rounded-md object-contain" />
      ) : null}
      <div className="prose mt-6 max-w-3xl whitespace-pre-wrap text-sm">{item.body}</div>
    </Container>
  );
}
