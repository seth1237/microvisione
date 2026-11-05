import { Suspense } from "react";
import { AccountOrderDetail } from "@/components/account/account-records";

export async function generateStaticParams() {
  return [{ id: "none" }];
}

export const metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading order…</p>}>
      <AccountOrderDetail id={id} />
    </Suspense>
  );
}
