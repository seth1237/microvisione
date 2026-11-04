import { Reveal } from "@/components/motion/reveal";
import type { PublicGalleryPhoto } from "@/lib/api/site-media";

export function SiteGallery({ photos }: { photos: PublicGalleryPhoto[] }) {
  return (
    <section className="bg-paper py-12" aria-labelledby="gallery-heading" id="gallery">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 id="gallery-heading" className="text-2xl">Gallery</h2>
        </Reveal>
        {photos.length ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <Reveal delay={(index % 3) * 70}>
                <figure className="group overflow-hidden rounded-2xl border border-line bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <img src={photo.imageUrl} alt={photo.caption} className="aspect-[4/3] w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                  {photo.caption ? <figcaption className="px-4 py-3 text-sm text-ink">{photo.caption}</figcaption> : null}
                </figure>
              </Reveal>
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
