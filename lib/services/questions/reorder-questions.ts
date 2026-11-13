import { prisma } from "@/lib/prisma"
import type { ReorderQuestionsInput } from "@/lib/validations/questions"

type ReorderResult = "ok" | "not_found" | "conflict"

export async function reorderQuestions(
  formId: string,
  input: ReorderQuestionsInput
): Promise<ReorderResult> {
  const { items } = input
  const sectionIds = [...new Set(items.map((i) => i.sectionId))]

  return prisma.$transaction(
    async (tx) => {
      // 1. CHECK every section belongs to this form
      const sectionCount = await tx.section.count({
        where: { id: { in: sectionIds }, formId },
      })
      if (sectionCount !== sectionIds.length) return "not_found"

      // 2. CHECK the list matches what's in those sections right now
      //    (questions that are in those sections, or that are being moved there)
      const current = await tx.question.findMany({
        where: {
          formId,
          deletedAt: null,
          OR: [
            { sectionId: { in: sectionIds } },
            { id: { in: items.map((i) => i.id) } },
          ],
        },
        select: { id: true },
      })

      const sent = new Set(items.map((i) => i.id))
      const sameList =
        current.length === sent.size && current.every((q) => sent.has(q.id))
      if (!sameList) return "conflict" // something changed meanwhile

      // 3. RENUMBER each section 0, 1, 2… in the order given
      for (const sectionId of sectionIds) {
        const inThisSection = items
          .filter((i) => i.sectionId === sectionId)
          .sort((a, b) => a.position - b.position)

        for (let index = 0; index < inThisSection.length; index++) {
          await tx.question.update({
            where: { id: inThisSection[index].id },
            data: { sectionId, position: index },
          })
        }
      }

      // 4. MARK the form as modified
      await tx.form.update({
        where: { id: formId },
        data: { updatedAt: new Date() },
      })

      return "ok"
    },
    { timeout: 15000 } // many small updates; allow more than the default 5 seconds
  )
}
