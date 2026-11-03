import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getEvents } from "@/lib/api/content";
import { formatIsoDate } from "@/lib/utils/format";

export const metadata = {
  title: "Events and activities",
  description: "Exhibitions, events and company notes from Microvision Enterprises Ltd. Entries marked as examples are not confirmed programmes.",
};

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <Container className="py-8">
      <PageIntro
        eyebrow="Activities"
        title="Events and activities"
        lede="Newest first. Each card is tagged Event, Exhibition or Company news."
      />
      <div className="mt-4 max-w-2xl">
        <PlaceholderNote>The entries below are placeholders, including dates and venues.</PlaceholderNote>
      </div>
      <ul className="mt-8 space-y-4">
        {events.map((event) => (
          <li key={event.id}>
            <Link href={`/events/${event.slug}`} className="grid gap-4 rounded-md border border-line bg-surface p-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <div className="flex h-28 items-center justify-center rounded-md bg-paper text-center text-xs font-semibold text-muted">
                Photograph to be added
              </div>
              <div>
                <Badge>{event.category}</Badge>
                <h2 className="mt-2 text-xl">{event.title}</h2>
                <p className="mt-1 text-sm text-muted">{formatIsoDate(event.date)} · {event.location}</p>
                <p className="mt-2 text-sm">{event.summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
