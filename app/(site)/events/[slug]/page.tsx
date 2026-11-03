import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getEventBySlug, getEvents } from "@/lib/api/content";
import { formatIsoDate } from "@/lib/utils/format";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event" };
  return { title: event.title, description: event.summary, alternates: { canonical: `/events/${event.slug}` } };
}

export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-sm text-muted">Loading event…</div>}>
      <EventContent params={params} />
    </Suspense>
  );
}

async function EventContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  return (
    <Container className="py-8">
      <Badge>{event.category}</Badge>
      <h1 className="mt-3 text-3xl sm:text-4xl">{event.title}</h1>
      <p className="mt-2 text-muted">{formatIsoDate(event.date)} · {event.location}</p>
      <div className="mt-4 max-w-2xl">
        <PlaceholderNote>This activity is a placeholder.</PlaceholderNote>
      </div>
      <p className="mt-6 max-w-3xl">{event.body}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Photo gallery">
        {["Gallery 1", "Gallery 2", "Gallery 3"].map((label) => (
          <div key={label} className="flex h-40 items-center justify-center rounded-md border border-dashed border-line bg-paper text-sm text-muted">
            {label}: photograph to be added
          </div>
        ))}
      </div>
    </Container>
  );
}
