import { ResetForm } from "@/components/account/auth-forms";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata = { title: "Reset password" };

export default function ResetPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Reset password" lede="Demonstration only. The new password is not stored on a server." />
      <div className="mt-8">
        <ResetForm />
      </div>
    </Container>
  );
}
