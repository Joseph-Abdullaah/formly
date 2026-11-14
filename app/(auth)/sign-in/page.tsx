import type { Metadata } from "next"

import { SignInForm } from "@/components/formly/auth/sign-in-form"

export const metadata: Metadata = { title: "Sign in · Formly" }

export default function SignInPage() {
  return <SignInForm />
}
