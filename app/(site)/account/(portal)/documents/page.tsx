import { AccountDocuments } from "@/components/account/account-documents";

export const metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <div>
      <h1 className="text-3xl">Documents</h1>
      <p className="mt-2 text-sm text-muted">Files Microvision has uploaded for this account.</p>
      <AccountDocuments />
    </div>
  );
}
