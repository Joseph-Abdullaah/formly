"use client"

import * as React from "react"
import { CircleAlertIcon, UploadIcon } from "lucide-react"

import type { Question } from "@/components/formly/form-data"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/** The respondent-side extra question for "Collect email addresses". */
export interface EmailQuestion {
  id: string
  type: "EMAIL"
  title: string
  required?: boolean
}

export type AnswerValue = string | string[] | undefined

/** "Other" answers are stored with this prefix so the free text travels with the choice. */
export const OTHER_PREFIX = "__other__:"

// 16px text and 44px targets so phones don't zoom; checked states take the form accent.
const bigInput = "h-11 text-base md:text-base"
const themedRadio =
  "size-5 border-2 data-[state=checked]:border-form-accent [&_svg]:size-2.5 [&_svg]:fill-form-accent"
const themedCheckbox =
  "size-5 border-2 data-[state=checked]:border-form-accent data-[state=checked]:bg-form-accent data-[state=checked]:text-on-form-accent"

interface RespondentQuestionProps {
  question: Question | EmailQuestion
  value: AnswerValue
  onChange: (value: AnswerValue) => void
  error?: string
  className?: string
}

/** One question as respondents see it, for every type. */
function RespondentQuestion({ question: q, value, onChange, error, className }: RespondentQuestionProps) {
  const id = React.useId()
  const titleId = `${id}-title`
  const errorId = `${id}-error`
  const descId = `${id}-desc`
  const describedBy = error ? errorId : undefined
  const required = !!q.required
  const full = q.type === "EMAIL" ? null : q

  let control: React.ReactNode
  switch (q.type) {
    case "EMAIL":
    case "SHORT_ANSWER":
    case "DATE":
    case "TIME":
      control = (
        <Input
          id={`${id}-input`}
          type={q.type === "EMAIL" ? "email" : q.type === "DATE" ? "date" : q.type === "TIME" ? "time" : "text"}
          autoComplete={q.type === "EMAIL" ? "email" : undefined}
          placeholder={q.type === "EMAIL" ? "you@example.com" : q.type === "SHORT_ANSWER" ? "Your answer" : undefined}
          aria-labelledby={titleId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(bigInput, q.type === "SHORT_ANSWER" || q.type === "EMAIL" ? "sm:w-2/3" : "w-auto")}
        />
      )
      break
    case "PARAGRAPH":
      control = (
        <Textarea
          placeholder="Your answer"
          aria-labelledby={titleId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-24 text-base md:text-base"
        />
      )
      break
    case "MULTIPLE_CHOICE": {
      const v = (value as string) ?? ""
      const isOther = v.startsWith(OTHER_PREFIX)
      control = (
        <div className="flex flex-col gap-1">
          <RadioGroup
            aria-labelledby={titleId}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            value={isOther ? "__other__" : v}
            onValueChange={(nv) => onChange(nv === "__other__" ? OTHER_PREFIX : nv)}
            className="gap-0"
          >
            {q.options.map((o) => (
              <label key={o.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
                <RadioGroupItem value={o.id} className={themedRadio} />
                {o.label}
              </label>
            ))}
            {q.hasOther ? (
              <div className="flex min-h-11 items-center gap-3 text-base">
                <RadioGroupItem value="__other__" aria-label="Other" className={themedRadio} />
                <span>Other:</span>
                <Input
                  aria-label="Other answer"
                  value={isOther ? v.slice(OTHER_PREFIX.length) : ""}
                  onChange={(e) => onChange(OTHER_PREFIX + e.target.value)}
                  className="h-9 flex-1 border-0 border-b rounded-none px-0 text-base shadow-none focus-visible:ring-0 md:text-base"
                />
              </div>
            ) : null}
          </RadioGroup>
          {v && !required ? (
            <Button type="button" variant="ghost" size="sm" className="self-end" onClick={() => onChange(undefined)}>
              Clear selection
            </Button>
          ) : null}
        </div>
      )
      break
    }
    case "CHECKBOXES": {
      const list = (value as string[]) ?? []
      const other = list.find((x) => x.startsWith(OTHER_PREFIX))
      const toggle = (key: string, on: boolean) =>
        onChange(on ? [...list, key] : list.filter((x) => x !== key))
      control = (
        <div
          role="group"
          aria-labelledby={titleId}
          aria-describedby={describedBy}
          className="flex flex-col"
        >
          {q.options.map((o) => (
            <label key={o.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
              <Checkbox
                checked={list.includes(o.id)}
                onCheckedChange={(c) => toggle(o.id, c === true)}
                aria-invalid={!!error}
                className={themedCheckbox}
              />
              {o.label}
            </label>
          ))}
          {q.hasOther ? (
            <div className="flex min-h-11 items-center gap-3 text-base">
              <Checkbox
                aria-label="Other"
                checked={other !== undefined}
                onCheckedChange={(c) =>
                  onChange(c === true ? [...list, OTHER_PREFIX] : list.filter((x) => !x.startsWith(OTHER_PREFIX)))
                }
                className={themedCheckbox}
              />
              <span>Other:</span>
              <Input
                aria-label="Other answer"
                value={other ? other.slice(OTHER_PREFIX.length) : ""}
                onChange={(e) =>
                  onChange([...list.filter((x) => !x.startsWith(OTHER_PREFIX)), OTHER_PREFIX + e.target.value])
                }
                className="h-9 flex-1 rounded-none border-0 border-b px-0 text-base shadow-none focus-visible:ring-0 md:text-base"
              />
            </div>
          ) : null}
        </div>
      )
      break
    }
    case "DROPDOWN":
      control = (
        <Select value={(value as string) ?? ""} onValueChange={onChange}>
          <SelectTrigger
            aria-labelledby={titleId}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="h-11 w-full text-base data-[size=default]:h-11 sm:w-2/3"
          >
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            {q.options.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-base">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      break
    case "LINEAR_SCALE": {
      const { min = 1, max = 5, minLabel, maxLabel } = q.config
      const steps = Array.from({ length: max - min + 1 }, (_, i) => String(min + i))
      control = (
        <div className="flex items-end gap-3 overflow-x-auto pb-1 text-sm">
          {minLabel ? <span className="hidden pb-3 text-muted-foreground sm:block">{minLabel}</span> : null}
          <RadioGroup
            aria-labelledby={titleId}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            orientation="horizontal"
            value={(value as string) ?? ""}
            onValueChange={onChange}
            className="flex gap-1"
          >
            {steps.map((s) => (
              <label key={s} className="flex min-w-11 cursor-pointer flex-col items-center gap-2 py-1">
                <span className="tabular-nums">{s}</span>
                <RadioGroupItem value={s} className={themedRadio} />
              </label>
            ))}
          </RadioGroup>
          {maxLabel ? <span className="hidden pb-3 text-muted-foreground sm:block">{maxLabel}</span> : null}
        </div>
      )
      break
    }
    case "FILE_UPLOAD":
      control = (
        <Button type="button" variant="outline" className="self-start" aria-describedby={describedBy}>
          <UploadIcon />
          Add file
        </Button>
      )
      break
  }

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-colors",
        error && "border-destructive",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 id={titleId} className="text-base font-normal">
          {q.title || "Untitled question"}
          {required ? (
            <span className="text-destructive" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </h2>
        {full?.showDescription && full.description ? (
          <p id={descId} className="text-sm text-muted-foreground">
            {full.description}
          </p>
        ) : null}
      </div>
      {control}
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-sm text-destructive">
          <CircleAlertIcon aria-hidden="true" className="size-4" />
          {error}
        </p>
      ) : null}
    </section>
  )
}

export { RespondentQuestion }
