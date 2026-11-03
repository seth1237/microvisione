import type { Metadata } from "next";
import "./medtrack.css";

export const metadata: Metadata = {
  title: {
    default: "MedTrack QR",
    template: "%s | MedTrack QR",
  },
  description: "Hospital medical equipment inventory, QR status, and maintenance tracking.",
  robots: { index: false, follow: false },
};

export default function MedTrackRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="medtrack-root min-h-full">{children}</div>;
}
