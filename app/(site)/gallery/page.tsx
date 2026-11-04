import { SiteGallery } from "@/components/home/site-gallery";
import { liveGallery } from "@/lib/api/site-media";

export const instant = false;

export const metadata = {
  title: "Gallery",
  description: "Photographs from Microvision Enterprises Ltd.",
};

export default async function GalleryPage() {
  const photos = await liveGallery();
  return <SiteGallery photos={photos} />;
}
