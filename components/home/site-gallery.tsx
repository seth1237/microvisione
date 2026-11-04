import type { PublicGalleryPhoto } from "@/lib/api/site-media";

export function SiteGallery({ photos }: { photos: PublicGalleryPhoto[] }) {
  return (
    <section className="bg-paper py-12" aria-labelledby="gallery-heading" id="gallery">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 id="gallery-heading" className="text-2xl">Gallery</h2>
        {photos.length ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id}>
              <figure className="overflow-hidden rounded-2xl border border-line bg-white">
                <img src={photo.imageUrl} alt={photo.caption} className="aspect-[4/3] w-full object-cover" />
                {photo.caption ? <figcaption className="px-4 py-3 text-sm text-ink">{photo.caption}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
        ) : (
          <p className="mt-6 text-sm text-muted">No photographs yet.</p>
        )}
      </div>
    </section>
  );
}
