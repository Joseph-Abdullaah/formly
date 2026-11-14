"use client"

import * as React from "react"
import Link from "next/link"
import { CheckIcon } from "lucide-react"
import { toast } from "sonner"

import {
  AuthDivider,
  AuthHeading,
  AuthShell,
  AuthStatus,
  EMAIL_RE,
  FormAlert,
  GoogleButton,
  PasswordInput,
} from "@/components/formly/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

/** Mock: this password simulates the server rejecting the credentials. */
const MOCK_WRONG_PASSWORD = "wrongpass"

function SignInForm() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const [serverError, setServerError] = React.useState(false)
  const [signedIn, setSignedIn] = React.useState(false)

  const errors = {
    email: !EMAIL_RE.test(email) ? (email ? "Enter an email address like name@example.com" : "Enter your email") : "",
    password: password ? "" : "Enter your password",
  }
  const show = (k: keyof typeof errors) => (tried ? errors[k] : "")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (errors.email || errors.password) return
    if (password === MOCK_WRONG_PASSWORD) return setServerError(true)
    setSignedIn(true)
  }

  return (
    <AuthShell
      labelledBy="si-title"
      footer={
        <>
          No account yet?{" "}
          <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {signedIn ? (
        <AuthStatus
          icon={CheckIcon}
          title="Welcome back, Joseph"
          actions={
            <Button asChild className="h-10 w-full">
              <Link href="/dashboard">Go to my forms</Link>
            </Button>
          }
        >
          You&apos;re signed in as {email}.
        </AuthStatus>
      ) : (
        <form noValidate onSubmit={submit} className="flex flex-col gap-5">
          <AuthHeading id="si-title" title="Sign in to Formly" description="Your forms and responses are waiting." />
          <GoogleButton onClick={() => toast("Google sign-in opens in a pop-up")}>Continue with Google</GoogleButton>
          <AuthDivider />
          {serverError ? (
            <FormAlert>That email and password don&apos;t match. Check them or reset your password.</FormAlert>
          ) : null}
          <FieldGroup className="gap-5">
            <Field data-invalid={!!show("email") || undefined}>
              <FieldLabel htmlFor="si-email">Email</FieldLabel>
              <Input
                id="si-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-10"
                value={email}
                aria-invalid={!!show("email")}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setServerError(false)
                }}
              />
              {show("email") ? <FieldError>{show("email")}</FieldError> : null}
            </Field>
            <Field data-invalid={!!show("password") || undefined}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="si-pass">Password</FieldLabel>
                <Link href="/forgot-password" className="text-xs underline-offset-4 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="si-pass"
                autoComplete="current-password"
                value={password}
                aria-invalid={!!show("password")}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setServerError(false)
                }}
              />
              {show("password") ? <FieldError>{show("password")}</FieldError> : null}
            </Field>
          </FieldGroup>
          <Button type="submit" className="h-10 w-full">
            Sign in
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

export { SignInForm }
