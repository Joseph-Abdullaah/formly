import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function duplicateForm(formId: string, userId: string) {
  const source = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: {
          questions: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
            include: { options: { orderBy: { position: "asc" } } },
          },
        },
      },
    },
  })

  if (!source) return null

  return prisma.$transaction(
    async (tx) => {
      const copy = await tx.form.create({
        data: {
          ownerId: userId,
          publicId: nanoid(12),
          title: `Copy of ${source.title}`,
          description: source.description,
          theme: source.theme as Prisma.InputJsonValue,
          acceptingResponses: source.acceptingResponses,
          closedMessage: source.closedMessage,
          collectEmails: source.collectEmails,
          limitOneResponse: source.limitOneResponse,
          allowEditAfterSubmit: source.allowEditAfterSubmit,
          showProgressBar: source.showProgressBar,
          shuffleQuestions: source.shuffleQuestions,
          requiredByDefault: source.requiredByDefault,
          confirmationMessage: source.confirmationMessage,
          showSubmitAnother: source.showSubmitAnother,
          isQuiz: source.isQuiz,
          quizSettings: (source.quizSettings ?? undefined) as
            Prisma.InputJsonValue | undefined,
        },
      })

      const newSectionId = new Map<string, string>()

      for (const section of source.sections) {
        const created = await tx.section.create({
          data: {
            formId: copy.id,
            title: section.title,
            description: section.description,
            position: section.position,
            afterAction: section.afterAction,
          },
        })
        newSectionId.set(section.id, created.id)
      }

      const mapSection = (oldId: string | null) =>
        oldId ? (newSectionId.get(oldId) ?? null) : null

      for (const section of source.sections) {
        if (section.targetSectionId) {
          await tx.section.update({
            where: { id: newSectionId.get(section.id)! },
            data: { targetSectionId: mapSection(section.targetSectionId) },
          })
        }
      }

      for (const section of source.sections) {
        for (const q of section.questions) {
          await tx.question.create({
            data: {
              formId: copy.id,
              sectionId: newSectionId.get(section.id)!,
              type: q.type,
              title: q.title,
              description: q.description,
              required: q.required,
              position: q.position,
              imageUrl: q.imageUrl,
              config: q.config as Prisma.InputJsonValue,
              points: q.points,
              feedback: (q.feedback ?? undefined) as
                Prisma.InputJsonValue | undefined,
              options: {
                create: q.options.map((o) => ({
                  kind: o.kind,
                  label: o.label,
                  position: o.position,
                  isOther: o.isOther,
                  isCorrect: o.isCorrect,
                  imageUrl: o.imageUrl,
                  navAction: o.navAction,
                  targetSectionId: mapSection(o.targetSectionId),
                })),
              },
            },
          })
        }
      }

      return { id: copy.id, publicId: copy.publicId, title: copy.title }
    },
    { timeout: 20000 }
  )
}
