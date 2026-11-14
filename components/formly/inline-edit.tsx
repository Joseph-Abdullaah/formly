import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Borderless fields that edit in place inside the editor's cards. A rule sits
 * under the field; on focus it thickens and turns the form accent.
 */
const inlineBase =
  "w-full min-w-0 border-0 border-b border-transparent bg-transparent px-0 py-1 outline-none transition-[border-color] duration-150 placeholder:text-muted-foreground hover:border-border focus:border-b-2 focus:border-form-accent focus:pb-[3px] disabled:opacity-50"

function InlineInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input type="text" className={cn(inlineBase, className)} {...props} />
}

function AutoGrowTextarea({ className, rows = 1, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn(inlineBase, "field-sizing-content resize-none", className)}
      {...props}
    />
  )
}

export { InlineInput, AutoGrowTextarea }
