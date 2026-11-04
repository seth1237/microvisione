import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EventDiscussion } from "@/components/events/event-discussion";
import { EventStory } from "@/components/events/event-story";
import { Badge } from "@/components/ui/badge";
import { isSafeHref } from "@/lib/platform/event-body";
import { Container } from "@/components/ui/container";
import { getEventBySlug } from "@/lib/api/content";
import { formatIsoDate } from "@/lib/utils/format";
import type { Metadata } from "next";

export const instant = false;

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
      {event.blocks?.length ? <EventStory blocks={event.blocks} /> : <p className="mt-6 max-w-3xl">{event.body}</p>}
      {event.registrationUrl && isSafeHref(event.registrationUrl) ? (
        <p className="mt-6">
          <a href={event.registrationUrl} className="font-semibold text-brand" target={event.registrationUrl.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">
            Register
          </a>
        </p>
      ) : null}
      <EventDiscussion slug={event.slug} />
      {event.coverUrl ? (
        <img src={event.coverUrl} alt="" className="mt-8 aspect-[16/9] w-full max-w-3xl rounded-md object-cover" />
      ) : null}
    </Container>
  );
}
