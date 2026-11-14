import type { Metadata } from "next"

import { ResetPasswordForm } from "@/components/formly/auth/reset-password-form"

export const metadata: Metadata = { title: "Choose a new password · Formly" }

// Mock: ?expired=1 shows the expired-link state until the token check is wired.
export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const { expired } = await props.searchParams
  return <ResetPasswordForm expired={expired === "1"} />
}
