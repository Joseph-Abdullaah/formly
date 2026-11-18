import { NextResponse } from "next/server"
import { getUser, sendError } from "@/lib/api"
import { createFormSchema, listFormsSchema } from "@/lib/validations/form"
import { createForm, listForms } from "@/lib/services/forms"

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user)
      return sendError(
        401,
        "UNAUTHORIZED",
        "You must be logged in to create a form."
      )

    const body = await req.json().catch(() => null)
    if (body === null)
      return sendError(400, "BAD_REQUEST", "Invalid JSON body.")

    const result = createFormSchema.safeParse(body)
    if (!result.success)
      return sendError(422, "VALIDATION_ERROR", "Invalid data")

    const form = await createForm(user.id, result.data.title)
    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUser()
    if (!user) return sendError(401, "UNAUTHENTICATED", "Sign in to continue")

    const searchParams = new URL(req.url).searchParams
    const result = listFormsSchema.safeParse(Object.fromEntries(searchParams))
    if (!result.success)
      return sendError(422, "VALIDATION_ERROR", "Invalid query")

    const data = await listForms(user.id, result.data)
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return sendError(500, "INTERNAL", "Something went wrong")
  }
}
