import { NextResponse } from "next/server"
import { getUser, sendError } from "@/lib/api"
import { getFormRole } from "@/lib/permissions"
import { deleteForm, getFormById, updateForm } from "@/lib/services/forms"
import { updateFormSchema } from "@/lib/validations/form"

type Context = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id } = await params
    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const form = await getFormById(id)
    if (!form) return sendError(404, "NOT_FOUND", "Form not found")

    return NextResponse.json({ ...form, role })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id } = await params
    const body = await req.json().catch(() => null)
    if (!body) return sendError(400, "BAD_REQUEST", "Body must be valid JSON")

    const result = updateFormSchema.safeParse(body)
    if (!result.success)
      return sendError(422, "VALIDATION_ERROR", "Invalid data")

    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")

    const updatedForm = await updateForm(id, result.data)

    return NextResponse.json(updatedForm)
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}

export async function DELETE(req: Request, { params }: Context) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const { id } = await params
    const role = await getFormRole(id, user.id)
    if (!role) return sendError(404, "NOT_FOUND", "Form not found")
    if (role !== "owner")
      return sendError(403, "FORBIDDEN", "Only the owner can delete this form")

    await deleteForm(id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}
