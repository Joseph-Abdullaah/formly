import { NextResponse } from "next/server"
import { getUser, sendError } from "@/lib/api"
import { getFormRole } from "@/lib/permissions"
import { reorderQuestionsSchema } from "@/lib/validations/questions"
import { reorderQuestions } from "@/lib/services/questions"

type Context = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id } = await params
    const body = await request.json().catch(() => null)
    if (body === null)
      return sendError(400, "BAD_REQUEST", "Body must be valid JSON")

    const result = reorderQuestionsSchema.safeParse(body)
    if (!result.success)
      return sendError(422, "VALIDATION_ERROR", "Invalid data")

    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const outcome = await reorderQuestions(id, result.data)
    if (outcome === "not_found")
      return sendError(404, "NOT_FOUND", "Section not found in this form")
    if (outcome === "conflict") {
      return sendError(
        409,
        "CONFLICT",
        "The form changed while you were editing. Reload and try again."
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}
