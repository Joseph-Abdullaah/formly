import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export async function duplicateQuestion(formId: string, questionId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. READ the original with its options (and check it's in this form)
    const original = await tx.question.findFirst({
      where: { id: questionId, formId, deletedAt: null },
      include: { options: { orderBy: [{ kind: "asc" }, { position: "asc" }] } },
    })
    if (!original) return null

    // 2. MAKE ROOM right below the original
    const position = original.position + 1
    await tx.question.updateMany({
      where: {
        sectionId: original.sectionId,
        deletedAt: null,
        position: { gte: position },
      },
      data: { position: { increment: 1 } },
    })

    // 3. CREATE the copy with copies of its options
    const copy = await tx.question.create({
      data: {
        formId,
        sectionId: original.sectionId,
        position,
        type: original.type,
        title: original.title,
        description: original.description,
        required: original.required,
        imageUrl: original.imageUrl,
        config: original.config as Prisma.InputJsonValue,
        points: original.points,
        feedback: (original.feedback ?? undefined) as
          Prisma.InputJsonValue | undefined,
        options: {
          create: original.options.map((o) => ({
            kind: o.kind,
            label: o.label,
            position: o.position,
            isOther: o.isOther,
            isCorrect: o.isCorrect,
            imageUrl: o.imageUrl,
            navAction: o.navAction,
            targetSectionId: o.targetSectionId, // same form, so the same section ids are still right
          })),
        },
      },
      include: { options: { orderBy: [{ kind: "asc" }, { position: "asc" }] } },
    })

    // 4. MARK the form as modified
    await tx.form.update({
      where: { id: formId },
      data: { updatedAt: new Date() },
    })

    return copy
  })
}
