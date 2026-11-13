import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { mergeJson } from "@/lib/utils/json"
import { UpdateQuestionInput } from "@/lib/validations/questions"
import { getQuestionDefaults, optionKindsFor } from "./defaults"

export async function updateQuestion(
  formId: string,
  questionId: string,
  input: UpdateQuestionInput
) {
  const { type, config, feedback, ...simpleFields } = input
  // simpleFields = title, description, required, imageUrl, points

  return prisma.$transaction(async (tx) => {
    const current = await tx.question.findFirst({
      where: { id: questionId, formId, deletedAt: null },
      select: { type: true, config: true },
    })
    if (!current) return null

    const typeChanged = type !== undefined && type !== current.type

    let newConfig: Prisma.InputJsonObject | undefined
    if (typeChanged) {
      const defaults = getQuestionDefaults(type).config as Prisma.JsonObject
      newConfig = mergeJson(defaults, config ?? {})
    } else if (config) {
      newConfig = mergeJson(current.config, config)
    }

    if (typeChanged) {
      const allowedKinds = optionKindsFor(type)

      await tx.questionOption.deleteMany({
        where: { questionId, kind: { notIn: allowedKinds } },
      })

      const remaining = await tx.questionOption.count({ where: { questionId } })
      const defaultOptions = getQuestionDefaults(type).options
      if (remaining === 0 && defaultOptions.length > 0) {
        await tx.questionOption.createMany({
          data: defaultOptions.map((option) => ({ ...option, questionId })),
        })
      }
    }

    const question = await tx.question.update({
      where: { id: questionId },
      data: {
        ...simpleFields,
        ...(type && { type }),
        ...(newConfig && { config: newConfig }),
        // A nullable JSON column needs Prisma.DbNull to store an empty value
        ...(feedback !== undefined && { feedback: feedback ?? Prisma.DbNull }),
      },
      include: { options: { orderBy: [{ kind: "asc" }, { position: "asc" }] } },
    })

    // 5. MARK the form as modified
    await tx.form.update({
      where: { id: formId },
      data: { updatedAt: new Date() },
    })

    return question
  })
}
