import { LoginForm } from "@/components/account/auth-forms";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Create an account" lede="Use your email. Microvision sends a login code, and there is no password." />
      <div className="mt-8">
        <LoginForm />
      </div>
    </Container>
  );
}
