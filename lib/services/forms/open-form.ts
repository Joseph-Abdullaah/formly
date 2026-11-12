import { prisma } from "@/lib/prisma"

export async function markFormOpened(formId: string) {
  await prisma.$executeRaw`UPDATE "Form" SET "lastOpenedAt" = NOW() WHERE "id" = ${formId}`
}
