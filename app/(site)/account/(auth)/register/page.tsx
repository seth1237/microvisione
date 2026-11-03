import { RegisterForm } from "@/components/account/auth-forms";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Create an account" lede="A one-time code screen follows. No SMS is sent." />
      <div className="mt-8">
        <RegisterForm />
      </div>
    </Container>
  );
}
