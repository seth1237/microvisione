import { LoginForm } from "@/components/account/auth-forms";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Sign in" lede="Use an email or a Kenyan phone number. This account stays in your browser." />
      <div className="mt-8">
        <LoginForm />
      </div>
    </Container>
  );
}
