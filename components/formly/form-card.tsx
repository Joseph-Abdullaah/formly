"use client"

import * as React from "react"
import Link from "next/link"
import { CopyIcon, EllipsisVerticalIcon, ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/formly/confirm-dialog"
import type { Accent } from "@/components/formly/form-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Thumbnail: a miniature form page in the form's accent. */
function FormThumb({ className }: { className?: string }) {
  const line = (w: string) => <div className="h-1.5 rounded-full bg-input" style={{ width: w }} />
  return (
    <div aria-hidden="true" className={cn("flex h-33 flex-col gap-[7px] border-b bg-muted px-5.5 py-4.5", className)}>
      <div className="flex flex-col gap-[7px] rounded-md bg-card px-3 py-2.5 shadow-xs">
        <div className="mb-1.5 h-1 rounded-xs bg-form-accent" />
        {line("72%")}
        {line("48%")}
      </div>
      <div className="mt-1">{line("64%")}</div>
      {line("84%")}
    </div>
  )
}

export interface FormCardProps {
  title: string
  accent?: Accent
  /** e.g. "Edited 2 hours ago" */
  edited?: string
  responses?: number
  status?: "closed" | "quiz"
  href?: string
  onRename?: (name: string) => void
  onDuplicate?: () => void
  onOpenInNewTab?: () => void
  onDelete?: () => void
  className?: string
}

/** A form on the dashboard grid, with its ⋮ menu (Rename, Duplicate, Open in new tab, Delete). */
function FormCard({
  title,
  accent = "violet",
  edited = "Edited today",
  responses,
  status,
  href = "#",
  onRename,
  onDuplicate,
  onOpenInNewTab,
  onDelete,
  className,
}: FormCardProps) {
  const [renaming, setRenaming] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [draft, setDraft] = React.useState(title)

  const commitRename = () => {
    const name = draft.trim() || "Untitled form"
    setRenaming(false)
    onRename?.(name)
    toast(`Renamed to “${name}”`)
  }

  const meta =
    status === "closed" ? (
      <Badge variant="destructive">Closed</Badge>
    ) : status === "quiz" ? (
      <Badge variant="outline">Quiz</Badge>
    ) : responses ? (
      <Badge variant="secondary">
        {responses} {responses === 1 ? "response" : "responses"}
      </Badge>
    ) : (
      <span className="text-xs text-muted-foreground">No responses</span>
    )

  return (
    <div data-accent={accent} className={cn("relative", className)}>
      <Link
        href={href}
        className="block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs outline-none transition-colors duration-150 hover:border-ring focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <FormThumb />
        <div className="py-3 pr-11 pl-4">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-xs text-muted-foreground">{edited}</span>
            <span className="flex-none">{meta}</span>
          </div>
        </div>
      </Link>

      <div className="absolute right-1.5 bottom-2.5">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${title}`}>
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-50">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => {
                  setDraft(title)
                  setRenaming(true)
                }}
              >
                <PencilIcon />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  onDuplicate?.()
                  toast(`“${title}” duplicated`)
                }}
              >
                <CopyIcon />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onOpenInNewTab?.()}>
                <ExternalLinkIcon />
                Open in new tab
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(true)}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent className="sm:max-w-105">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              commitRename()
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename form</DialogTitle>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="rename-form">Form name</FieldLabel>
              <Input id="rename-form" value={draft} onChange={(e) => setDraft(e.target.value)} />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Rename</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Delete “${title}”?`}
        description={`This removes the form${responses ? ` and its ${responses} responses` : ""}. You can't undo this.`}
        confirmLabel="Delete form"
        onConfirm={() => {
          onDelete?.()
          toast(`“${title}” deleted`)
        }}
      />
    </div>
  )
}

export { FormCard, FormThumb }
