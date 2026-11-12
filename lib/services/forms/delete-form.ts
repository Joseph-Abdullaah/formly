import { prisma } from "@/lib/prisma"

export async function deleteForm(formId: string) {
  await prisma.form.delete({ where: { id: formId } })
}
