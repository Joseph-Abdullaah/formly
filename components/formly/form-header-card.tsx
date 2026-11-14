"use client"

import * as React from "react"

import type { Accent } from "@/components/formly/form-data"
import { AutoGrowTextarea, InlineInput } from "@/components/formly/inline-edit"
import { cn } from "@/lib/utils"

interface FormHeaderCardProps {
  title: string
  description?: string
  /** Edit in place (editor). Pass false on the respondent page. */
  editable?: boolean
  onChange?: (patch: { title?: string; description?: string }) => void
  accent?: Accent
  /** Respondent page: "* Indicates required question". */
  requiredNote?: boolean
  className?: string
  children?: React.ReactNode
}

/** First card of every form: title, description and the 8px form-accent bar. */
function FormHeaderCard({
  title,
  description = "",
  editable = true,
  onChange,
  accent,
  requiredNote,
  className,
  children,
}: FormHeaderCardProps) {
  return (
    <section
      data-accent={accent}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card px-6 pt-8 pb-6 text-card-foreground shadow-sm",
        "before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-form-accent",
        className
      )}
    >
      {editable ? (
        <div className="flex flex-col gap-2">
          <InlineInput
            aria-label="Form title"
            value={title}
            placeholder="Untitled form"
            onChange={(e) => onChange?.({ title: e.target.value })}
            className="text-3xl leading-9 font-semibold tracking-[-0.025em]"
          />
          <AutoGrowTextarea
            aria-label="Form description"
            value={description}
            placeholder="Form description"
            onChange={(e) => onChange?.({ description: e.target.value })}
            className="text-sm text-muted-foreground"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl leading-9 font-semibold tracking-[-0.025em] text-balance">
            {title || "Untitled form"}
          </h1>
          {description ? (
            <p className="text-sm whitespace-pre-line text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}
      {requiredNote ? (
        <p className="mt-4 border-t pt-3 text-sm text-destructive">
          <span aria-hidden="true">* </span>Indicates required question
        </p>
      ) : null}
      {children}
    </section>
  )
}

export { FormHeaderCard }
