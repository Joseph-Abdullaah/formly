import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function createForm(userId: string, title?: string) {
  return prisma.$transaction(async (tx) => {
    const form = await tx.form.create({
      data: {
        ownerId: userId,
        publicId: nanoid(12),
        title: title || "Untitled form",
      },
    })

    const section = await tx.section.create({
      data: {
        formId: form.id,
        position: 0,
      },
    })

    await tx.question.create({
      data: {
        formId: form.id,
        sectionId: section.id,
        type: "MULTIPLE_CHOICE",
        title: "Untitled question",
        position: 0,
        options: { create: { label: "Option 1", position: 0 } },
      },
    })

    return { id: form.id, publicId: form.publicId, title: form.title }
  })
}
