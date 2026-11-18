import { prisma } from "@/lib/prisma"

export async function getFormById(formId: string) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: {
          questions: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
            include: {
              options: { orderBy: { position: "asc" } },
            },
          },
        },
      },
      _count: { select: { responses: true } },
    },
  })

  if (!form) return null

  return {
    id: form.id,
    publicId: form.publicId,
    title: form.title,
    description: form.description,
    theme: form.theme,
    settings: {
      acceptingResponses: form.acceptingResponses,
      closedMessage: form.closedMessage,
      collectEmails: form.collectEmails,
      limitOneResponse: form.limitOneResponse,
      allowEditAfterSubmit: form.allowEditAfterSubmit,
      showProgressBar: form.showProgressBar,
      shuffleQuestions: form.shuffleQuestions,
      requiredByDefault: form.requiredByDefault,
      confirmationMessage: form.confirmationMessage,
      showSubmitAnother: form.showSubmitAnother,
      isQuiz: form.isQuiz,
      quizSettings: form.quizSettings,
    },
    sections: form.sections,
    responseCount: form._count.responses,
    updatedAt: form.updatedAt,
  }
}
