import { CheckIcon, CircleAlertIcon, CloudOffIcon } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type SaveState = "saving" | "saved" | "offline" | "error"

const COPY: Record<SaveState, string> = {
  saving: "Saving…",
  saved: "All changes saved",
  offline: "Offline. Changes will save when you reconnect.",
  error: "Couldn't save. Retrying…",
}

/** Autosave indicator next to the form name. Never toast autosave; this covers it. */
function SaveStatus({ status = "saved", className }: { status?: SaveState; className?: string }) {
  const Icon =
    status === "saving"
      ? null
      : status === "saved"
        ? CheckIcon
        : status === "offline"
          ? CloudOffIcon
          : CircleAlertIcon
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground",
        (status === "offline" || status === "error") && "text-destructive",
        className
      )}
    >
      {status === "saving" ? (
        <Spinner aria-hidden="true" role={undefined} className="size-3.5" />
      ) : Icon ? (
        <Icon aria-hidden="true" className="size-3.5" />
      ) : null}
      {COPY[status]}
    </span>
  )
}

export { SaveStatus }
