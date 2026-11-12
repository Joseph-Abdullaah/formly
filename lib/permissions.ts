import { prisma } from "@/lib/prisma"

export type FormRole = "owner" | "editor"

export async function getFormRole(
  formId: string,
  userId: string
): Promise<FormRole | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      ownerId: true,
      collaborators: { where: { userId }, select: { userId: true } },
    },
  })

  if (!form) return null
  if (form.ownerId === userId) return "owner"
  if (form.collaborators.length > 0) return "editor"
  return null
}
