"use client"

import * as React from "react"
import { toast } from "sonner"

import { useFormEditor, type FormFont } from "@/components/formly/editor/form-editor"
import { ThemePicker } from "@/components/formly/theme-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

/* Mock settings (replace with the Form row's settings columns). */
const MOCK_SETTINGS = {
  collectEmails: true,
  allowEditAfterSubmit: false,
  limitOneResponse: false,
  showProgressBar: false,
  shuffleQuestions: false,
  showSubmitAnother: true,
  requiredByDefault: false,
  confirmationMessage:
    "Thanks for registering. We'll send the venue details to your email a day before the meetup.",
  isQuiz: false,
  releaseGrade: "immediate" as "immediate" | "manual",
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: React.ReactNode
}) {
  const id = React.useId()
  return (
    <section
      aria-labelledby={title ? id : undefined}
      className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      {title ? (
        <div className="px-6 pt-5 pb-2">
          <h2 id={id} className="text-lg font-semibold">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      <div className="flex flex-col">{children}</div>
    </section>
  )
}

function Row({ children, className, first }: { children: React.ReactNode; className?: string; first?: boolean }) {
  return <div className={cn("px-6 py-3.5", !first && "border-t", className)}>{children}</div>
}

/** Label left, switch right; applies at once. */
function SwitchRow({
  label,
  description,
  defaultChecked,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (v: boolean) => void
}) {
  const id = React.useId()
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {description ? (
          <p id={`${id}-d`} className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <Switch
        id={id}
        aria-describedby={description ? `${id}-d` : undefined}
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}

const FONT_FAMILY: Record<FormFont, string> = {
  default: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
}

/** Editor → Settings tab. Every change "autosaves" (flashes SaveStatus). */
function SettingsView() {
  const { name, accent, setAccent, font, setFont, touch } = useFormEditor()
  const [quiz, setQuiz] = React.useState(MOCK_SETTINGS.isQuiz)
  const [release, setRelease] = React.useState<string>(MOCK_SETTINGS.releaseGrade)

  return (
    <div className="mx-auto flex w-full max-w-editor flex-col gap-3">
      <SettingsCard>
        <Row first className="py-5">
          <SwitchRow
            label="Make this a quiz"
            description="Set correct answers and point values. Respondents see a score when they submit."
            checked={quiz}
            onCheckedChange={(v) => {
              setQuiz(v)
              touch()
            }}
          />
        </Row>
        {quiz ? (
          <>
            <Row className="flex flex-col gap-3">
              <span id="release-label" className="text-sm font-medium">
                Release grade
              </span>
              <RadioGroup
                aria-labelledby="release-label"
                value={release}
                onValueChange={(v) => {
                  setRelease(v)
                  touch()
                }}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="immediate" id="rg-now" />
                  <Label htmlFor="rg-now" className="font-normal">
                    Immediately after each submission
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="manual" id="rg-later" />
                  <Label htmlFor="rg-later" className="font-normal">
                    Later, after I review answers
                  </Label>
                </div>
              </RadioGroup>
            </Row>
            <Row className="flex flex-col gap-3">
              <span className="text-sm font-medium">Respondents can see</span>
              {["Missed questions", "Correct answers", "Point values"].map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <Checkbox id={`see-${label}`} defaultChecked onCheckedChange={touch} />
                  <Label htmlFor={`see-${label}`} className="font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </Row>
          </>
        ) : null}
      </SettingsCard>

      <SettingsCard title="Responses" description="Who can respond and what you collect.">
        <Row>
          <SwitchRow
            label="Collect email addresses"
            description="Respondents enter an email before submitting."
            defaultChecked={MOCK_SETTINGS.collectEmails}
            onCheckedChange={touch}
          />
        </Row>
        <Row>
          <SwitchRow
            label="Allow response editing"
            description="Respondents get a link to change their answers after submitting."
            defaultChecked={MOCK_SETTINGS.allowEditAfterSubmit}
            onCheckedChange={touch}
          />
        </Row>
        <Row className="pb-5">
          <SwitchRow
            label="Limit to 1 response"
            description="Respondents sign in so each person can answer only once."
            defaultChecked={MOCK_SETTINGS.limitOneResponse}
            onCheckedChange={(v) => {
              touch()
              if (v) toast("Respondents will need to sign in")
            }}
          />
        </Row>
      </SettingsCard>

      <SettingsCard title="Presentation" description="What respondents see while and after they answer.">
        <Row>
          <SwitchRow label="Show progress bar" defaultChecked={MOCK_SETTINGS.showProgressBar} onCheckedChange={touch} />
        </Row>
        <Row>
          <SwitchRow
            label="Shuffle question order"
            defaultChecked={MOCK_SETTINGS.shuffleQuestions}
            onCheckedChange={touch}
          />
        </Row>
        <Row>
          <SwitchRow
            label="Show link to submit another response"
            defaultChecked={MOCK_SETTINGS.showSubmitAnother}
            onCheckedChange={touch}
          />
        </Row>
        <Row className="pb-5">
          <Field>
            <FieldLabel htmlFor="confirm-msg">Confirmation message</FieldLabel>
            <Textarea
              id="confirm-msg"
              rows={2}
              defaultValue={MOCK_SETTINGS.confirmationMessage}
              onChange={touch}
            />
            <FieldDescription>
              Shown after someone submits. Leave empty to use “Your response has been recorded.”
            </FieldDescription>
          </Field>
        </Row>
      </SettingsCard>

      <SettingsCard title="Theme" description="Colour and type for this form's public page.">
        <Row className="flex flex-wrap items-center justify-between gap-6">
          <span className="text-sm font-medium">Colour</span>
          <ThemePicker
            value={accent}
            onValueChange={(a) => {
              setAccent(a)
              touch()
            }}
          />
        </Row>
        <Row className="flex flex-wrap items-center justify-between gap-6">
          <span id="font-label" className="text-sm font-medium">
            Font
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            aria-labelledby="font-label"
            value={font}
            onValueChange={(v) => {
              if (!v) return
              setFont(v as FormFont)
              touch()
            }}
          >
            <ToggleGroupItem value="default" className="px-3">
              Default
            </ToggleGroupItem>
            <ToggleGroupItem value="serif" className="px-3 font-serif">
              Serif
            </ToggleGroupItem>
            <ToggleGroupItem value="mono" className="px-3 font-mono">
              Mono
            </ToggleGroupItem>
          </ToggleGroup>
        </Row>
        <Row className="pb-5">
          <p className="mb-2 text-xs text-muted-foreground">Preview</p>
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border bg-card px-5 pt-6 pb-4 before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-form-accent",
              FONT_FAMILY[font]
            )}
          >
            <p className="text-[22px] leading-7 font-semibold">{name || "Untitled form"}</p>
            <p className="mt-1 text-sm text-muted-foreground">Monthly meetup for network engineers.</p>
          </div>
        </Row>
      </SettingsCard>

      <SettingsCard title="Defaults">
        <Row className="pb-5">
          <SwitchRow
            label="Make questions required by default"
            description="Applies to questions you add from now on."
            defaultChecked={MOCK_SETTINGS.requiredByDefault}
            onCheckedChange={touch}
          />
        </Row>
      </SettingsCard>
    </div>
  )
}

export { SettingsView }
