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
  GoogleButton,
} from "@/components/formly/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const STRENGTH_WORDS = ["Use at least 8 characters.", "Okay. Longer is stronger.", "Good.", "Strong.", "Very strong."]

function passwordScore(p: string) {
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[0-9]/.test(p) && /[a-zA-Z]/.test(p)) score++
  if (/[^a-zA-Z0-9]/.test(p)) score++
  return score
}

function SignUpForm() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const errors = {
    name: name.trim() ? "" : "Enter your name",
    email: !EMAIL_RE.test(email) ? (email ? "Enter an email address like name@example.com" : "Enter your email") : "",
    password: password.length < 8 ? "Use at least 8 characters" : "",
  }
  const show = (k: keyof typeof errors) => (tried ? errors[k] : "")
  const score = passwordScore(password)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (errors.name || errors.email || errors.password) return
    setDone(true)
  }

  return (
    <AuthShell
      labelledBy="su-title"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {done ? (
        <AuthStatus
          icon={CheckIcon}
          title="Your account is ready"
          actions={
            <Button asChild className="h-10 w-full">
              <Link href="/dashboard?state=empty">Go to my forms</Link>
            </Button>
          }
        >
          Signed in as {email}. Start with a blank form or a template.
        </AuthStatus>
      ) : (
        <form noValidate onSubmit={submit} className="flex flex-col gap-[18px]">
          <AuthHeading
            id="su-title"
            title="Create your Formly account"
            description="Build a form in minutes and share it with one link."
          />
          <GoogleButton onClick={() => toast("Google sign-up opens in a pop-up")}>Sign up with Google</GoogleButton>
          <AuthDivider />
          <FieldGroup className="gap-[18px]">
            <Field data-invalid={!!show("name") || undefined}>
              <FieldLabel htmlFor="su-name">Name</FieldLabel>
              <Input
                id="su-name"
                autoComplete="name"
                className="h-10"
                value={name}
                aria-invalid={!!show("name")}
                onChange={(e) => setName(e.target.value)}
              />
              {show("name") ? <FieldError>{show("name")}</FieldError> : null}
            </Field>
            <Field data-invalid={!!show("email") || undefined}>
              <FieldLabel htmlFor="su-email">Email</FieldLabel>
              <Input
                id="su-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-10"
                value={email}
                aria-invalid={!!show("email")}
                onChange={(e) => setEmail(e.target.value)}
              />
              {show("email") ? <FieldError>{show("email")}</FieldError> : null}
            </Field>
            <Field data-invalid={!!show("password") || undefined}>
              <FieldLabel htmlFor="su-pass">Password</FieldLabel>
              <Input
                id="su-pass"
                type="password"
                autoComplete="new-password"
                className="h-10"
                value={password}
                aria-invalid={!!show("password")}
                aria-describedby="su-pass-help"
                onChange={(e) => setPassword(e.target.value)}
              />
              <div aria-hidden="true" className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1 rounded-full bg-border transition-colors",
                      score >= n && "bg-foreground",
                      n === 1 && password.length > 0 && score < 1 && "bg-destructive"
                    )}
                  />
                ))}
              </div>
              {show("password") ? (
                <FieldError id="su-pass-help">{show("password")}</FieldError>
              ) : (
                <FieldDescription id="su-pass-help" aria-live="polite">
                  {password.length ? STRENGTH_WORDS[score] : STRENGTH_WORDS[0]}
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
          <Button type="submit" className="h-10 w-full">
            Create account
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

export { SignUpForm }
