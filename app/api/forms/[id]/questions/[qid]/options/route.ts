import { NextResponse } from "next/server"
import { getUser, sendError } from "@/lib/api"
import { getFormRole } from "@/lib/permissions"
import { saveOptionsSchema } from "@/lib/validations/questions"
import { saveOptions } from "@/lib/services/questions"

type Context = { params: Promise<{ id: string; qid: string }> }

export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id, qid } = await params
    const body = await request.json().catch(() => null)
    if (body === null)
      return sendError(400, "BAD_REQUEST", "Body must be valid JSON")

    const result = saveOptionsSchema.safeParse(body)
    if (!result.success)
      return sendError(422, "VALIDATION_ERROR", "Invalid data")

    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const outcome = await saveOptions(id, qid, result.data)
    if (outcome.status === "not_found")
      return sendError(404, "NOT_FOUND", outcome.message)
    if (outcome.status === "invalid")
      return sendError(422, "VALIDATION_ERROR", outcome.message)

    return NextResponse.json({ options: outcome.options })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}
