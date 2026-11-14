import type { Metadata } from "next"

import { SignUpForm } from "@/components/formly/auth/sign-up-form"

export const metadata: Metadata = { title: "Sign up · Formly" }

export default function SignUpPage() {
  return <SignUpForm />
}
