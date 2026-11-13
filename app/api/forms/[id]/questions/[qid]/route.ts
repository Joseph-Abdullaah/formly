import { NextResponse } from "next/server"
import { getUser, sendError } from "@/lib/api"
import { getFormRole } from "@/lib/permissions"
import { updateQuestionSchema } from "@/lib/validations/questions"
import { updateQuestion, deleteQuestion } from "@/lib/services/questions"

type Context = { params: Promise<{ id: string; qid: string }> }

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id, qid } = await params
    const body = await request.json().catch(() => null)
    if (body === null)
      return sendError(400, "BAD_REQUEST", "Body must be valid JSON")

    const result = updateQuestionSchema.safeParse(body)
    if (!result.success)
      return sendError(422, "VALIDATION_ERROR", "Invalid data")

    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const question = await updateQuestion(id, qid, result.data)
    if (!question) return sendError(404, "NOT_FOUND", "Question not found")

    return NextResponse.json(question)
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id, qid } = await params

    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const deleted = await deleteQuestion(id, qid)
    if (!deleted) return sendError(404, "NOT_FOUND", "Question not found")

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}
