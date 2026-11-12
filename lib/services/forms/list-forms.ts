import { prisma } from "@/lib/prisma"

type ListFormsInput = {
  q?: string
  sort?: "updated" | "opened" | "title"
  page: number
  pageSize: number
}

export async function listForms(userId: string, input: ListFormsInput) {
  const { q, sort, page, pageSize } = input

  const where = {
    OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
    ...(q && { title: { contains: q, mode: "insensitive" as const } }),
  }

  const orderBy =
    sort === "title"
      ? { title: "asc" as const }
      : sort === "opened"
        ? { lastOpenedAt: { sort: "desc" as const, nulls: "last" as const } }
        : { updatedAt: "desc" as const }

  const [total, forms] = await prisma.$transaction([
    prisma.form.count({ where }),
    prisma.form.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        publicId: true,
        title: true,
        ownerId: true,
        theme: true,
        isQuiz: true,
        acceptingResponses: true,
        updatedAt: true,
        lastOpenedAt: true,
        _count: { select: { responses: true } },
      },
    }),
  ])

  const items = forms.map((form) => ({
    id: form.id,
    publicId: form.publicId,
    title: form.title,
    theme: form.theme,
    isQuiz: form.isQuiz,
    acceptingResponses: form.acceptingResponses,
    updatedAt: form.updatedAt,
    lastOpenedAt: form.lastOpenedAt,
    responseCount: form._count.responses,
    role: form.ownerId === userId ? "owner" : "editor",
  }))

  return { items, total, page, pageSize }
}
