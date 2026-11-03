import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { getEvents } from "@/lib/api/content";
import { formatIsoDate } from "@/lib/utils/format";

export const metadata = {
  title: "Events and activities",
  description: "Exhibitions, events and company notes from Microvision Enterprises Ltd.",
};

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <Container className="py-8">
      <PageIntro
        title="Events and activities"
        lede="Newest first."
      />
      {events.length === 0 ? <p className="mt-8 text-sm text-muted">No events yet.</p> : null}
      <ul className="mt-8 space-y-4">
        {events.map((event) => (
          <li key={event.id}>
            <Link href={`/events/${event.slug}`} className="grid gap-4 rounded-md border border-line bg-surface p-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              {event.coverUrl ? (
                <img src={event.coverUrl} alt="" className="h-28 w-full rounded-md object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-md bg-paper text-center text-xs font-semibold text-muted">
                  No photograph yet
                </div>
              )}
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
