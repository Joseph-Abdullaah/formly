import { NextResponse } from "next/server"
import { getUser, sendError } from "@/lib/api"
import { getFormRole } from "@/lib/permissions"
import { duplicateForm } from "@/lib/services/forms"

type Context = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id } = await params

    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const copy = await duplicateForm(id, user.id)
    if (!copy) return sendError(404, "NOT_FOUND", "Form not found")

    return NextResponse.json(copy, { status: 201 })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}
