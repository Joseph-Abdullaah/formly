import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export function sendError(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  )
}

export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user || null
}
