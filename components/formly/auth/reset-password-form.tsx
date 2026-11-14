"use client"

import * as React from "react"
import Link from "next/link"
import { CheckIcon, ClockIcon } from "lucide-react"

import { AuthHeading, AuthShell, AuthStatus, PasswordInput } from "@/components/formly/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

/** Mock: the account the reset link belongs to. */
const MOCK_RESET_EMAIL = "joseph@example.com"

interface ResetPasswordFormProps {
  /** Show the "link has expired" state (e.g. ?expired=1 until the token check is wired). */
  expired?: boolean
}

function ResetPasswordForm({ expired = false }: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const errors = {
    password: password.length < 8 ? "Use at least 8 characters" : "",
    confirm: confirm !== password ? "The passwords don't match" : "",
  }
  const show = (k: keyof typeof errors) => (tried ? errors[k] : "")

  let body: React.ReactNode
  if (done) {
    body = (
      <AuthStatus
        icon={CheckIcon}
        title="Password changed"
        actions={
          <Button asChild className="h-10 w-full">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        }
      >
        Sign in with your new password. We signed you out on your other devices.
      </AuthStatus>
    )
  } else if (expired) {
    body = (
      <AuthStatus
        alert
        icon={ClockIcon}
        title="This link has expired"
        actions={
          <Button asChild className="h-10 w-full">
            <Link href="/forgot-password">Send a new link</Link>
          </Button>
        }
      >
        Reset links work for 1 hour and only once. Ask for a new one and use it straight away.
      </AuthStatus>
    )
  } else {
    body = (
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setTried(true)
          if (!errors.password && !errors.confirm) setDone(true)
        }}
      >
        <AuthHeading
          id="rp-title"
          title="Choose a new password"
          description={`For ${MOCK_RESET_EMAIL}. Use at least 8 characters.`}
        />
        <FieldGroup className="gap-5">
          <Field data-invalid={!!show("password") || undefined}>
            <FieldLabel htmlFor="rp-pass">New password</FieldLabel>
            <PasswordInput
              id="rp-pass"
              autoComplete="new-password"
              value={password}
              aria-invalid={!!show("password")}
              onChange={(e) => setPassword(e.target.value)}
            />
            {show("password") ? <FieldError>{show("password")}</FieldError> : null}
          </Field>
          <Field data-invalid={!!show("confirm") || undefined}>
            <FieldLabel htmlFor="rp-confirm">Confirm new password</FieldLabel>
            <PasswordInput
              id="rp-confirm"
              autoComplete="new-password"
              value={confirm}
              aria-invalid={!!show("confirm")}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {show("confirm") ? <FieldError>{show("confirm")}</FieldError> : null}
          </Field>
        </FieldGroup>
        <Button type="submit" className="h-10 w-full">
          Change password
        </Button>
      </form>
    )
  }

  return (
    <AuthShell
      labelledBy="rp-title"
      footer={
        <Link href="/sign-in" className="underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {body}
    </AuthShell>
  )
}

export { ResetPasswordForm }
