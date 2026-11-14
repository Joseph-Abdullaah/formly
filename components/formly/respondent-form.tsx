"use client"

import * as React from "react"
import { CheckIcon, CircleAlertIcon, EyeIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/formly/confirm-dialog"
import type { Accent, FormDraft } from "@/components/formly/form-data"
import { FormHeaderCard } from "@/components/formly/form-header-card"
import {
  OTHER_PREFIX,
  RespondentQuestion,
  type AnswerValue,
  type EmailQuestion,
} from "@/components/formly/respondent-question"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type Answers = Record<string, AnswerValue>

export interface RespondentFormProps {
  form: FormDraft
  accent?: Accent
  /** Optional respondent font (Form.theme.font). */
  font?: "default" | "serif" | "mono"
  /** Adds a required, validated Email question first. */
  collectEmail?: boolean
  /** Shows a banner; nothing is recorded. */
  preview?: boolean
  confirmationMessage?: string
  showSubmitAnother?: boolean
  onSubmit?: (answers: Answers) => void
  className?: string
}

function isEmpty(v: AnswerValue) {
  if (v === undefined || v === "" || v === OTHER_PREFIX) return true
  if (Array.isArray(v)) return v.filter((x) => x !== OTHER_PREFIX).length === 0
  return false
}

/** The public form: validation on submit, error summary, confirmation. */
function RespondentForm({
  form,
  accent = "violet",
  font = "default",
  collectEmail = false,
  preview = false,
  confirmationMessage = "Your response has been recorded.",
  showSubmitAnother = true,
  onSubmit,
  className,
}: RespondentFormProps) {
  const questions = React.useMemo(
    () => [
      ...(collectEmail
        ? [{ id: "__email", type: "EMAIL", title: "Email", required: true } satisfies EmailQuestion]
        : []),
      ...form.questions,
    ],
    [collectEmail, form.questions]
  )
  const [answers, setAnswers] = React.useState<Answers>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [tried, setTried] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const validate = (a: Answers) => {
    const e: Record<string, string> = {}
    for (const q of questions) {
      const v = a[q.id]
      if (q.required && isEmpty(v)) e[q.id] = "This is a required question"
      else if (q.type === "EMAIL" && typeof v === "string" && v && !EMAIL_RE.test(v))
        e[q.id] = "Enter an email address like name@example.com"
    }
    return e
  }

  const set = (id: string, v: AnswerValue) => {
    const next = { ...answers, [id]: v }
    setAnswers(next)
    if (tried) setErrors(validate(next))
  }

  const reset = () => {
    setAnswers({})
    setErrors({})
    setTried(false)
    setDone(false)
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setTried(true)
    const e = validate(answers)
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) {
      requestAnimationFrame(() => {
        const el = rootRef.current?.querySelector<HTMLElement>(`[data-question="${first}"]`)
        el?.scrollIntoView({ block: "center", behavior: "smooth" })
        el?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true })
      })
      return
    }
    onSubmit?.(answers)
    setDone(true)
  }

  const nErr = Object.keys(errors).length
  const fontClass = font === "serif" ? "font-serif" : font === "mono" ? "font-mono" : undefined

  return (
    <div
      ref={rootRef}
      data-accent={accent}
      className={cn(
        "min-h-full bg-[color-mix(in_oklch,var(--form-accent)_5%,var(--background))] px-3 py-4 sm:px-4 sm:py-10",
        fontClass,
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-respondent flex-col gap-3">
        {done ? (
          <FormHeaderCard editable={false} title={form.title} accent={accent}>
            <div aria-live="polite" className="mt-5 flex items-start gap-3">
              <span className="grid size-8 flex-none place-items-center rounded-full bg-form-accent text-on-form-accent">
                <CheckIcon aria-hidden="true" className="size-4" />
              </span>
              <p className="pt-1 text-base">
                {preview ? "Preview only. Your answers were not recorded." : confirmationMessage}
              </p>
            </div>
            {showSubmitAnother ? (
              <div className="mt-6 border-t pt-4">
                <Button variant="link" className="px-0 text-base" onClick={reset}>
                  Submit another response
                </Button>
              </div>
            ) : null}
          </FormHeaderCard>
        ) : (
          <form noValidate onSubmit={submit} className="flex flex-col gap-3">
            {preview ? (
              <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
                <EyeIcon aria-hidden="true" className="size-4" />
                Preview. Responses are not recorded.
              </div>
            ) : null}
            <FormHeaderCard
              editable={false}
              title={form.title}
              description={form.description}
              accent={accent}
              requiredNote={questions.some((q) => q.required)}
            />
            {nErr ? (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-destructive bg-card px-4 py-3 text-sm text-destructive"
              >
                <CircleAlertIcon aria-hidden="true" className="size-4" />
                {nErr === 1
                  ? "1 question needs an answer before you can submit."
                  : `${nErr} questions need an answer before you can submit.`}
              </div>
            ) : null}
            {questions.map((q) => (
              <div key={q.id} data-question={q.id}>
                <RespondentQuestion
                  question={q}
                  value={answers[q.id]}
                  error={errors[q.id]}
                  onChange={(v) => set(q.id, v)}
                />
              </div>
            ))}
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <Button type="submit" variant="accent" size="lg" className="h-12 min-w-30 flex-1 sm:h-10 sm:flex-none">
                Submit
              </Button>
              <ConfirmDialog
                trigger={
                  <Button type="button" variant="ghost">
                    Clear form
                  </Button>
                }
                title="Clear form?"
                description="This removes your answers from all questions."
                confirmLabel="Clear form"
                onConfirm={reset}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export { RespondentForm }
