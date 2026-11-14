import Link from "next/link"
import { EyeIcon, PencilIcon } from "lucide-react"

import { SAMPLE_FORM, type Accent } from "@/components/formly/form-data"
import { RespondentForm } from "@/components/formly/respondent-form"
import { Button } from "@/components/ui/button"

/* Mock: the form being previewed (replace with GET /api/forms/[id]). */
const MOCK_PREVIEW = { form: SAMPLE_FORM, accent: "violet" as Accent }

/** Creator's preview: the public form with a banner; nothing is recorded. */
function PreviewView({ formId }: { formId: string }) {
  const { form, accent } = MOCK_PREVIEW
  return (
    <div className="min-h-svh bg-background">
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-primary px-4 text-primary-foreground">
        <EyeIcon aria-hidden="true" className="size-4 flex-none" />
        <span className="min-w-0 truncate font-medium">Previewing “{form.title}”</span>
        <Button asChild size="sm" variant="secondary" className="ml-auto">
          <Link href={`/forms/${formId}/edit`}>
            <PencilIcon data-icon="inline-start" />
            Back to editing
          </Link>
        </Button>
      </div>
      <RespondentForm form={form} accent={accent} preview collectEmail />
    </div>
  )
}

export { PreviewView }
