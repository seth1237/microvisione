import {
  Activity,
  Droplets,
  FlaskConical,
  Gauge,
  HeartPulse,
  Microscope,
  Monitor,
  RotateCw,
  ScanLine,
  Sparkles,
  TestTube,
  TestTubes,
  Wind,
} from "lucide-react";
import type { CategoryIcon } from "@/types";

const icons = {
  flask: FlaskConical,
  droplets: Droplets,
  tubes: TestTubes,
  scan: ScanLine,
  heart: HeartPulse,
  microscope: Microscope,
  tube: TestTube,
  activity: Activity,
  spark: Sparkles,
  centrifuge: RotateCw,
  gauge: Gauge,
  wind: Wind,
  monitor: Monitor,
} as const;

export function CategoryGlyph({
  name,
  className,
}: {
  name: CategoryIcon;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
