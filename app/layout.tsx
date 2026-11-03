import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/lib/site";
import { palette, tokenCss } from "@/styles/tokens";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Medical and laboratory equipment in Kenya",
    template: "%s | Microvision Enterprises Ltd",
  },
  description: site.positioning,
  applicationName: site.shortName,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    description: site.positioning,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: palette.brandBlue,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <style href="microvision-tokens" precedence="default">
          {tokenCss}
        </style>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            telephone: site.phoneTel,
            address: {
              "@type": "PostalAddress",
              streetAddress: "Loipi Plaza, Lunga Lunga Road",
              addressLocality: "Nairobi",
              addressRegion: "Nairobi",
              addressCountry: "KE",
            },
          }}
        />
      </body>
    </html>
  );
}
