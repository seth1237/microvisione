import { MessageCircle } from "lucide-react";
import { site, whatsAppHref } from "@/lib/site";

export function WhatsAppButton() {
  const href = whatsAppHref("Hello Microvision Enterprises Ltd, I would like to enquire about laboratory equipment.");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-44 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success text-on-accent shadow-pop lg:bottom-6"
      aria-label={`Chat with Microvision on WhatsApp ${site.phoneDisplay}`}
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
