import { getSampleDocuments } from "@/lib/api/content";
import { formatIsoDate } from "@/lib/utils/format";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const documents = await getSampleDocuments();
  return (
    <div>
      <h1 className="text-3xl">Documents</h1>
      <p className="mt-2 text-sm text-muted">Sample invoices, ETR receipts and statements. The files are placeholders, not tax documents.</p>
      <ul className="mt-6 divide-y divide-line rounded-md border border-line bg-surface">
        {documents.map((document) => (
          <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{document.title}</p>
              <p className="text-sm text-muted">{document.kind} · {formatIsoDate(document.issuedAt)} · sample</p>
            </div>
            <a href={document.href} download className="text-sm font-semibold text-brand">
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
