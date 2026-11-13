import { prisma } from "@/lib/prisma"

export async function deleteQuestion(formId: string, questionId: string) {
  return prisma.$transaction(async (tx) => {
    const question = await tx.question.findFirst({
      where: { id: questionId, formId, deletedAt: null },
      select: { sectionId: true, position: true },
    })
    if (!question) return null

    const answerCount = await tx.answer.count({ where: { questionId } })

    if (answerCount > 0) {
      await tx.question.update({
        where: { id: questionId },
        data: { deletedAt: new Date() },
      })
    } else {
      await tx.question.delete({
        where: { id: questionId },
      })
    }

    await tx.question.updateMany({
      where: {
        sectionId: question.sectionId,
        deletedAt: null,
        position: { gt: question.position },
      },
      data: { position: { decrement: 1 } },
    })

    await tx.form.update({
      where: { id: formId },
      data: { updatedAt: new Date() },
    })

    return true
  })
}
