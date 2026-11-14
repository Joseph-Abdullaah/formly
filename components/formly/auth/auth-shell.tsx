"use client"

import * as React from "react"
import { CircleAlertIcon, EyeIcon, EyeOffIcon } from "lucide-react"

import { Logo } from "@/components/formly/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Centered card on the muted canvas: logo above, `footer` below. */
function AuthShell({
  children,
  footer,
  labelledBy,
}: {
  children: React.ReactNode
  footer?: React.ReactNode
  labelledBy?: string
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted px-4 py-12">
      <Logo href="/" size={32} />
      <section
        aria-labelledby={labelledBy}
        className="flex w-full max-w-auth flex-col gap-5 rounded-xl border bg-card px-6 py-7 text-card-foreground shadow-sm"
      >
        {children}
      </section>
      {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
    </main>
  )
}

function AuthHeading({ id, title, description }: { id: string; title: string; description?: React.ReactNode }) {
  return (
    <div>
      <h1 id={id} className="text-xl font-semibold">
        {title}
      </h1>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}

/** Result panel: success, sent, expired. */
function AuthStatus({
  icon: Icon,
  title,
  children,
  actions,
  alert,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  title: string
  children: React.ReactNode
  actions: React.ReactNode
  alert?: boolean
}) {
  return (
    <div role={alert ? "alert" : "status"} className="flex flex-col items-start gap-3">
      <span className="grid size-10 place-items-center rounded-full bg-muted">
        <Icon aria-hidden className="size-4" />
      </span>
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="text-sm text-muted-foreground">{children}</div>
      <div className="mt-1 flex w-full flex-wrap gap-2">{actions}</div>
    </div>
  )
}

function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function GoogleButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Button type="button" variant="outline" className="h-10 w-full" onClick={onClick}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
        <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8Z" />
        <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10l3.7-2.9Z" />
        <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4Z" />
      </svg>
      {children}
    </Button>
  )
}

/** Password field with a show / hide toggle. */
function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className={cn("h-10 pr-11", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        onClick={() => setShow((v) => !v)}
        className="absolute top-1 right-1"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-destructive px-3 py-2.5 text-sm text-destructive"
    >
      <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 flex-none" />
      <span>{children}</span>
    </div>
  )
}

export { AuthShell, AuthHeading, AuthStatus, AuthDivider, GoogleButton, PasswordInput, FormAlert }
