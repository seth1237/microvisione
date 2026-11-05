import { AccountAccess } from "@/components/account/auth-forms";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Your account" lede="Create an account with your facility details, then sign in later with a code sent to your email." />
      <div className="mt-8">
        <AccountAccess initial="register" />
      </div>
    </Container>
  );
}
