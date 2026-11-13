import { prisma } from "@/lib/prisma"
import type { CreateQuestionInput } from "@/lib/validations/questions"
import { getQuestionDefaults } from "./defaults"

export async function createQuestion(
  formId: string,
  input: CreateQuestionInput
) {
  const { sectionId, type, afterQuestionId } = input

  return prisma.$transaction(async (tx) => {
    const section = await tx.section.findUnique({
      where: { id: sectionId, formId },
      select: { id: true },
    })
    if (!section) return null

    let position: number
    if (afterQuestionId) {
      const after = await tx.question.findUnique({
        where: { id: afterQuestionId, sectionId, deletedAt: null },
        select: { position: true },
      })
      if (!after) return null

      position = after.position + 1

      await tx.question.updateMany({
        where: { sectionId, position: { gte: position } },
        data: { position: { increment: 1 } },
      })
    } else {
      const last = await tx.question.findFirst({
        where: { sectionId },
        orderBy: { position: "desc" },
        select: { position: true },
      })
      position = last ? last.position + 1 : 0
    }

    const form = await tx.form.findUnique({
      where: { id: formId },
      select: { requiredByDefault: true },
    })

    const defaults = getQuestionDefaults(type)

    const question = await tx.question.create({
      data: {
        formId,
        sectionId,
        type,
        position,
        title: defaults.title,
        config: defaults.config,
        required: form?.requiredByDefault ?? false,
        options: { create: defaults.options },
      },
      include: { options: { orderBy: [{ kind: "asc" }, { position: "asc" }] } },
    })

    // 4. MARK the form as modified (for "Last modified" on the dashboard)
    await tx.form.update({
      where: { id: formId },
      data: { updatedAt: new Date() },
    })

    return question
  })
}
