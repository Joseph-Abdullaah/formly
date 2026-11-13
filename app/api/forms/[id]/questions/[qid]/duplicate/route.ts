import { NextResponse } from "next/server"
import { getUser, sendError } from "@/lib/api"
import { getFormRole } from "@/lib/permissions"
import { duplicateQuestion } from "@/lib/services/questions"

type Context = { params: Promise<{ id: string; qid: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id, qid } = await params

    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const copy = await duplicateQuestion(id, qid)
    if (!copy) return sendError(404, "NOT_FOUND", "Question not found")

    return NextResponse.json(copy, { status: 201 })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}
