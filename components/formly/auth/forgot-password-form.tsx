"use client"

import * as React from "react"
import Link from "next/link"
import { MailIcon } from "lucide-react"
import { toast } from "sonner"

import { AuthHeading, AuthShell, AuthStatus, EMAIL_RE } from "@/components/formly/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const bad = !EMAIL_RE.test(email)
  const error = tried && bad ? (email ? "Enter an email address like name@example.com" : "Enter your email") : ""

  return (
    <AuthShell
      labelledBy="fp-title"
      footer={
        <Link href="/sign-in" className="underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <AuthStatus
          icon={MailIcon}
          title="Check your email"
          actions={
            <>
              <Button asChild>
                <Link href="/sign-in">Back to sign in</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/reset-password">Open the link</Link>
              </Button>
              <Button variant="outline" onClick={() => toast(`Sent another link to ${email}`)}>
                Resend link
              </Button>
            </>
          }
        >
          If an account uses {email}, a reset link is on its way. The link works for 1 hour.
        </AuthStatus>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            setTried(true)
            if (!bad) setSent(true)
          }}
        >
          <AuthHeading
            id="fp-title"
            title="Reset your password"
            description="Enter the email you sign in with and we'll send you a link to choose a new password."
          />
          <Field data-invalid={!!error || undefined}>
            <FieldLabel htmlFor="fp-email">Email</FieldLabel>
            <Input
              id="fp-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10"
              value={email}
              aria-invalid={!!error}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
          <Button type="submit" className="h-10 w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

export { ForgotPasswordForm }
