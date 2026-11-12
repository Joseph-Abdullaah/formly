import type { UpdateFormInput } from "@/lib/validations/form"
import { prisma } from "@/lib/prisma"
import { mergeJson } from "@/lib/utils/json"

export async function updateForm(formId: string, input: UpdateFormInput) {
  const { title, description, theme, settings } = input
  const { quizSettings, ...settingColumns } = settings ?? {}

  const current = await prisma.form.findUnique({
    where: { id: formId },
    select: { theme: true, quizSettings: true },
  })

  return prisma.form.update({
    where: { id: formId },
    data: {
      title,
      description,
      ...settingColumns,
      ...(theme && { theme: mergeJson(current?.theme, theme) }),
      ...(quizSettings && {
        quizSettings: mergeJson(current?.quizSettings, quizSettings),
      }),
    },
    select: { id: true, updatedAt: true },
  })
}
