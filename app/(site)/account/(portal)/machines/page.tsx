import { getSampleMachines } from "@/lib/api/content";
import { site } from "@/lib/site";
import { formatIsoDate, isPastIsoDate } from "@/lib/utils/format";

export const metadata = { title: "My machines" };

export default async function MachinesPage() {
  const machines = await getSampleMachines();
  return (
    <div>
      <h1 className="text-3xl">My machines</h1>
      <p className="mt-2 text-sm text-muted">Sample installed equipment. Serial numbers are not real.</p>
      <div className="mt-6 overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Sample installed machines</caption>
          <thead>
            <tr className="border-b border-line">
              {["Model", "Serial", "Installed", "Warranty", "Site"].map((heading) => (
                <th key={heading} scope="col" className="p-3">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => {
              const expired = machine.warrantyUntil ? isPastIsoDate(machine.warrantyUntil, site.catalogueAsOf) : false;
              return (
                <tr key={machine.id} className="border-b border-line">
                  <td className="p-3 font-semibold">{machine.model}</td>
                  <td className="p-3">{machine.serial}</td>
                  <td className="p-3">{formatIsoDate(machine.installDate)}</td>
                  <td className="p-3">
                    {machine.warrantyUntil ? formatIsoDate(machine.warrantyUntil) : "TBC"}
                    {expired ? <span className="ml-2 font-semibold text-warning">Expired flag</span> : null}
                  </td>
                  <td className="p-3">{machine.site}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
