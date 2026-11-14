import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/components/formly/auth/forgot-password-form"

export const metadata: Metadata = { title: "Reset your password · Formly" }

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
