import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">404</p>
      <h1 className="mt-2 text-4xl">Page not found</h1>
      <p className="mt-3 max-w-xl text-muted">That address is not in the Microvision catalogue. Try the product list or contact the Nairobi office.</p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/" className="text-brand">Home</Link>
        <Link href="/products" className="text-brand">Products</Link>
        <Link href="/contact" className="text-brand">Contact</Link>
      </div>
    </Container>
  );
}
