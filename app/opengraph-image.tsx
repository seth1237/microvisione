import { ImageResponse } from "next/og";
import { palette } from "@/styles/tokens";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Microvision Enterprises Ltd — medical and laboratory equipment in Kenya";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: palette.paper,
          color: palette.ink,
          padding: 64,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: palette.brandRed, fontWeight: 700 }}>
          Microvision Enterprises Ltd
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 64, lineHeight: 1.1, fontWeight: 700, maxWidth: 900 }}>
          Medical and laboratory equipment in Kenya
        </div>
        <div style={{ display: "flex", fontSize: 28, color: palette.brandBlue }}>
          Loipi Plaza, Industrial Area, Nairobi · 0790 669 988
        </div>
      </div>
    ),
    { ...size },
  );
}
