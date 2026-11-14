"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { ACCENTS, type Accent } from "@/components/formly/form-data"
import { cn } from "@/lib/utils"

const ACCENT_LABEL: Record<Accent, string> = {
  violet: "Violet",
  blue: "Blue",
  sky: "Sky",
  emerald: "Emerald",
  amber: "Amber",
  orange: "Orange",
  rose: "Rose",
  slate: "Slate",
}

interface ThemePickerProps {
  value?: Accent
  defaultValue?: Accent
  onValueChange?: (accent: Accent) => void
  label?: string
  className?: string
}

/** The eight form accents as a radio group (sets Form.theme.color). */
function ThemePicker({
  value,
  defaultValue = "violet",
  onValueChange,
  label = "Form colour",
  className,
}: ThemePickerProps) {
  return (
    <RadioGroupPrimitive.Root
      aria-label={label}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onValueChange={(v) => onValueChange?.(v as Accent)}
      orientation="horizontal"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {ACCENTS.map((accent) => (
        <RadioGroupPrimitive.Item
          key={accent}
          value={accent}
          aria-label={ACCENT_LABEL[accent]}
          data-accent={accent}
          className="grid size-8 place-items-center rounded-full bg-form-accent text-on-form-accent ring-offset-2 ring-offset-background outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:ring-2 data-[state=checked]:ring-form-accent"
        >
          <RadioGroupPrimitive.Indicator>
            <CheckIcon aria-hidden="true" className="size-4" />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
}

export { ThemePicker, ACCENT_LABEL }
