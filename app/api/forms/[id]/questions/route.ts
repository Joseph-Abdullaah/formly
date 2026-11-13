import { NextResponse } from "next/server"
import { getUser, sendError } from "@/lib/api"
import { getFormRole } from "@/lib/permissions"
import { createQuestionSchema } from "@/lib/validations/questions"
import { createQuestion } from "@/lib/services/questions"

type Context = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id } = await params
    const body = await req.json().catch(() => null)
    if (body === null)
      return sendError(400, "BAD_REQUEST", "Body must be valid JSON")

    const result = createQuestionSchema.safeParse(body)
    if (!result.success)
      return sendError(422, "VALIDATION_ERROR", "Invalid data")

    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const question = await createQuestion(id, result.data)
    if (!question)
      return sendError(
        404,
        "NOT_FOUND",
        "Section or question not found in this form"
      )

    // 5. REPLY
    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}
