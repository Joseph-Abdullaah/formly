import Link from "next/link"
import { LockIcon } from "lucide-react"

import { SAMPLE_FORM, makeQuestion, type Accent, type FormDraft } from "@/components/formly/form-data"
import { FormHeaderCard } from "@/components/formly/form-header-card"
import { RespondentForm } from "@/components/formly/respondent-form"
import { Button } from "@/components/ui/button"

/* ------------------------------------------------------------------ */
/* Mock public forms (replace with a lookup by Form.publicId)          */
/*   /f/k3Jd9aQ2xP7z  open form                                        */
/*   /f/L4bG7cQ9mN2x  closed form                                      */
/*   anything else    404                                              */
/* ------------------------------------------------------------------ */

export interface PublicForm {
  publicId: string
  form: FormDraft
  accent: Accent
  font: "default" | "serif" | "mono"
  collectEmails: boolean
  acceptingResponses: boolean
  closedMessage?: string
  confirmationMessage: string
  showSubmitAnother: boolean
}

const MOCK_PUBLIC_FORMS: PublicForm[] = [
  {
    publicId: "k3Jd9aQ2xP7z",
    form: SAMPLE_FORM,
    accent: "violet",
    font: "default",
    collectEmails: true,
    acceptingResponses: true,
    confirmationMessage:
      "Thanks for registering. We'll send the venue details to your email a day before the meetup.",
    showSubmitAnother: true,
  },
  {
    publicId: "L4bG7cQ9mN2x",
    form: {
      title: "Lab group sign-up",
      description: "Pick a lab slot for this semester.",
      questions: [makeQuestion("SHORT_ANSWER", { id: "lab-q1", title: "Student ID", required: true })],
    },
    accent: "orange",
    font: "default",
    collectEmails: false,
    acceptingResponses: false,
    closedMessage:
      "All lab groups are full for this semester. Contact the course office if you still need a place.",
    confirmationMessage: "Your response has been recorded.",
    showSubmitAnother: false,
  },
]

export function findMockPublicForm(publicId: string) {
  return MOCK_PUBLIC_FORMS.find((f) => f.publicId === publicId) ?? null
}

/* ------------------------------------------------------------------ */

function RespondentFooter() {
  return (
    <footer className="flex flex-col items-center gap-3 px-4 pt-4 pb-8 text-center">
      <p className="text-xs text-muted-foreground">Never submit passwords through Formly.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-muted-foreground underline-offset-4 hover:underline"
      >
        <span
          aria-hidden="true"
          className="flex size-5 flex-col items-start justify-center gap-[1.5px] rounded-[5px] bg-muted-foreground pl-[5px]"
        >
          <i className="block h-[3px] w-2.5 rounded-full bg-background" />
          <i className="block h-[3px] w-[7px] rounded-full bg-background" />
          <i className="block size-[3px] rounded-full bg-background" />
        </span>
        Make your own form with Formly
      </Link>
    </footer>
  )
}

function ClosedForm({ title, message }: { title: string; message?: string }) {
  return (
    <div className="mx-auto w-full max-w-respondent px-3 py-4 sm:px-4 sm:py-10">
      <FormHeaderCard editable={false} title={title}>
        <div className="mt-5 flex items-start gap-3">
          <span className="grid size-8 flex-none place-items-center rounded-full bg-muted">
            <LockIcon aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-base font-medium">This form is no longer accepting responses.</p>
            {message ? <p className="mt-1.5 text-[15px] leading-[22px] text-muted-foreground">{message}</p> : null}
          </div>
        </div>
      </FormHeaderCard>
    </div>
  )
}

/** The public page at /f/[publicId]: open form, or the closed message. */
function PublicFormView({ publicForm: p }: { publicForm: PublicForm }) {
  return (
    <div
      data-accent={p.accent}
      className="flex min-h-svh flex-col bg-[color-mix(in_oklch,var(--form-accent)_5%,var(--background))]"
    >
      <div className="flex-1">
        {p.acceptingResponses ? (
          <RespondentForm
            form={p.form}
            accent={p.accent}
            font={p.font}
            collectEmail={p.collectEmails}
            confirmationMessage={p.confirmationMessage}
            showSubmitAnother={p.showSubmitAnother}
            className="bg-transparent"
          />
        ) : (
          <ClosedForm title={p.form.title} message={p.closedMessage} />
        )}
      </div>
      <RespondentFooter />
    </div>
  )
}

/** 404 for a public link that doesn't match any form. */
function FormNotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <main className="mx-auto flex w-full max-w-120 flex-1 flex-col items-center justify-center gap-3 px-5 py-18 text-center">
        <p className="text-[56px] leading-[56px] font-semibold tracking-[-0.04em] text-muted-foreground tabular-nums">
          404
        </p>
        <h1 className="text-[22px] leading-[30px] font-semibold">This form doesn&apos;t exist</h1>
        <p className="text-[15px] leading-[22px] text-muted-foreground">
          The link may be mistyped, or the owner deleted the form. Ask the person who sent it for a new link.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/">Go to Formly</Link>
        </Button>
      </main>
      <RespondentFooter />
    </div>
  )
}

export { PublicFormView, FormNotFound }
