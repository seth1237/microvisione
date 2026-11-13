import { deleteManufacturerRecord } from "@/lib/api/delete-manufacturer"

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return deleteManufacturerRecord(request, id)
}
