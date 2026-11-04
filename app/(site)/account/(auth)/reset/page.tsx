import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata = { title: "Sign in" };

export default function ResetPage() {
  return (
    <Container className="py-8">
      <PageIntro title="No password to reset" lede="Sign in with the code sent to your email." />
      <p className="mt-8 text-sm">
        <Link href="/account/login" className="font-semibold text-brand">Send a login code</Link>
      </p>
    </Container>
  );
}
