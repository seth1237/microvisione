import { AccountAccess } from "@/components/account/auth-forms";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Your account" lede="Sign in with the code sent to your email, or create an account for a new facility." />
      <div className="mt-8">
        <AccountAccess initial="login" />
      </div>
    </Container>
  );
}
