import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { RequireAuth } from "@/components/account/require-auth";
import { Container } from "@/components/ui/container";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-8">
      <RequireAuth>
        <Suspense fallback={null}>
          <AccountNav />
        </Suspense>
        {children}
      </RequireAuth>
    </Container>
  );
}
