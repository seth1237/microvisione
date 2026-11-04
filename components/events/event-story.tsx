import { publicAssetUrl } from "@/lib/platform/backend-url";
import { isSafeHref, sanitizeRichText, vimeoId, youtubeId, type EventBlock } from "@/lib/platform/event-body";

export function EventStory({ blocks }: { blocks: EventBlock[] }) {
  return (
    <div className="mt-6 max-w-3xl space-y-4 text-ink">
      {blocks.map((block) => {
        if (block.type === "heading") {
          return block.level === 3 ? (
            <h3 key={block.id} className="pt-2 text-xl">{block.text}</h3>
          ) : (
            <h2 key={block.id} className="pt-2 text-2xl">{block.text}</h2>
          );
        }
        if (block.type === "paragraph") {
          return <div key={block.id} className="leading-7" dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.html) }} />;
        }
        if (block.type === "quote") {
          return (
            <blockquote key={block.id} className="border-l-4 border-brand pl-4 text-ink">
              <p>{block.text}</p>
              {block.cite ? <footer className="mt-1 text-sm text-muted">{block.cite}</footer> : null}
            </blockquote>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={block.id} className={block.ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>
              {block.items.filter(Boolean).map((item) => <li key={item}>{item}</li>)}
            </List>
          );
        }
        if (block.type === "image") {
          const src = publicAssetUrl(block.image.secureUrl);
          if (!src) return null;
          return (
            <figure key={block.id}>
              <img src={src} alt={block.alt || ""} className="w-full rounded-md object-cover" />
              {block.caption ? <figcaption className="mt-2 text-sm text-muted">{block.caption}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === "link" && isSafeHref(block.url)) {
          return (
            <p key={block.id}>
              <a href={block.url} className="font-semibold text-brand" target={block.url.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">{block.label || block.url}</a>
              {block.note ? <span className="mt-1 block text-sm text-muted">{block.note}</span> : null}
            </p>
          );
        }
        if (block.type === "video") {
          const youtube = youtubeId(block.url);
          const vimeo = vimeoId(block.url);
          const src = youtube ? `https://www.youtube.com/embed/${youtube}` : vimeo ? `https://player.vimeo.com/video/${vimeo}` : "";
          if (!src) return null;
          return (
            <div key={block.id} className="relative aspect-video overflow-hidden rounded-md">
              <iframe title="Event video" src={src} className="absolute inset-0 h-full w-full border-0" allowFullScreen />
            </div>
          );
        }
        if (block.type === "divider") return <hr key={block.id} className="border-line" />;
        return null;
      })}
    </div>
  );
}
