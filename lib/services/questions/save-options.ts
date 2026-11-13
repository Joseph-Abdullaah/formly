import { prisma } from "@/lib/prisma"
import type { SaveOptionsInput } from "@/lib/validations/questions"
import { optionKindsFor } from "./defaults"

type SaveOptionsResult =
  | {
      status: "ok"
      options: Awaited<ReturnType<typeof prisma.questionOption.findMany>>
    }
  | { status: "not_found"; message: string }
  | { status: "invalid"; message: string }

export async function saveOptions(
  formId: string,
  questionId: string,
  input: SaveOptionsInput
): Promise<SaveOptionsResult> {
  const { options } = input

  return prisma.$transaction(
    async (tx) => {
      // 1. CHECK the question belongs to this form
      const question = await tx.question.findFirst({
        where: { id: questionId, formId, deletedAt: null },
        select: { type: true, options: { select: { id: true } } },
      })
      if (!question)
        return { status: "not_found", message: "Question not found" }

      // 2. CHECK the options fit the question type
      const allowedKinds = optionKindsFor(question.type)
      if (allowedKinds.length === 0) {
        return {
          status: "invalid",
          message: "This question type has no options",
        }
      }
      if (options.some((o) => !allowedKinds.includes(o.kind))) {
        return {
          status: "invalid",
          message: "Option kind doesn't match the question type",
        }
      }
      for (const kind of allowedKinds) {
        if (!options.some((o) => o.kind === kind)) {
          return {
            status: "invalid",
            message: `Add at least one ${kind.toLowerCase()} option`,
          }
        }
      }

      const otherCount = options.filter((o) => o.isOther).length
      const otherAllowed =
        question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOXES"
      if (otherCount > 1 || (otherCount === 1 && !otherAllowed)) {
        return {
          status: "invalid",
          message: "Only one 'Other' option, on multiple choice or checkboxes",
        }
      }

      // 3. CHECK every id sent belongs to THIS question
      const savedIds = new Set(question.options.map((o) => o.id))
      const sentIds = options.filter((o) => o.id).map((o) => o.id as string)
      if (sentIds.some((id) => !savedIds.has(id))) {
        return {
          status: "not_found",
          message: "Option not found on this question",
        }
      }

      // 4. CHECK "go to section" targets belong to this form
      const targets = [
        ...new Set(options.map((o) => o.targetSectionId).filter(Boolean)),
      ] as string[]
      if (targets.length > 0) {
        const found = await tx.section.count({
          where: { id: { in: targets }, formId },
        })
        if (found !== targets.length) {
          return {
            status: "not_found",
            message: "Target section not found in this form",
          }
        }
      }

      // 5. DELETE saved options that are missing from the list
      await tx.questionOption.deleteMany({
        where: { questionId, id: { notIn: sentIds } },
      })

      // 6. UPDATE or CREATE each option, numbering positions per kind
      const nextPosition: Record<string, number> = {
        CHOICE: 0,
        ROW: 0,
        COLUMN: 0,
      }

      for (const option of options) {
        const { id, ...fields } = option
        const data = { ...fields, position: nextPosition[option.kind]++ }

        if (id) {
          await tx.questionOption.update({ where: { id }, data }) // existing
        } else {
          await tx.questionOption.create({ data: { ...data, questionId } }) // new
        }
      }

      // 7. MARK the form as modified
      await tx.form.update({
        where: { id: formId },
        data: { updatedAt: new Date() },
      })

      // 8. RETURN the saved list, now with ids for the new options
      const saved = await tx.questionOption.findMany({
        where: { questionId },
        orderBy: [{ kind: "asc" }, { position: "asc" }],
      })
      return { status: "ok", options: saved }
    },
    { timeout: 15000 }
  )
}
