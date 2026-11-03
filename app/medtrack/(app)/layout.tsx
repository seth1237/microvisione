import { MedTrackShell } from "@/components/medtrack/shell";

export default function MedTrackAppLayout({ children }: { children: React.ReactNode }) {
  return <MedTrackShell>{children}</MedTrackShell>;
}
