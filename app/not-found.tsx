import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="py-16">
      <h1 className="text-4xl">Page not found</h1>
      <p className="mt-3 max-w-xl text-muted">That address is not on the Microvision site. Go back to the catalogue or contact the Nairobi office.</p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/" className="text-brand">Home</Link>
        <Link href="/contact" className="text-brand">Contact</Link>
      </div>
    </Container>
  );
}
