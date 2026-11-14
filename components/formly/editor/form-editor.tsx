"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FileTextIcon,
  ImageIcon,
  PaletteIcon,
  PrinterIcon,
  SendIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/formly/confirm-dialog"
import { SAMPLE_FORM, makeQuestion, type Accent, type FormDraft } from "@/components/formly/form-data"
import { SaveStatus, type SaveState } from "@/components/formly/save-status"
import { ShareDialog } from "@/components/formly/share-dialog"
import { ThemePicker } from "@/components/formly/theme-picker"
import { MOCK_USER, UserMenu } from "@/components/formly/user-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Mock form (replace with GET /api/forms/[id])                        */
/* ------------------------------------------------------------------ */

const MOCK_EDITOR_FORM = {
  publicId: "k3Jd9aQ2xP7z",
  name: "Meetup registration",
  accent: "violet" as Accent,
  responseCount: 42,
  draft: SAMPLE_FORM,
}

/** A blank form starts with one multiple-choice question (fixed ids keep SSR stable). */
const NEW_FORM_DRAFT: FormDraft = {
  title: "Untitled form",
  description: "",
  questions: [
    makeQuestion("MULTIPLE_CHOICE", { id: "q-new", options: [{ id: "o-new", label: "Option 1" }] }),
  ],
}

export type FormFont = "default" | "serif" | "mono"

interface FormEditorState {
  formId: string
  publicLink: string
  name: string
  setName: (name: string) => void
  accent: Accent
  setAccent: (accent: Accent) => void
  font: FormFont
  setFont: (font: FormFont) => void
  draft: FormDraft
  responseCount: number
  status: SaveState
  setStatus: (status: SaveState) => void
  /** Flash "Saving…" then "All changes saved" (800ms after the last call). */
  touch: () => void
  openShare: () => void
}

const FormEditorContext = React.createContext<FormEditorState | null>(null)

export function useFormEditor() {
  const ctx = React.useContext(FormEditorContext)
  if (!ctx) throw new Error("useFormEditor must be used inside <FormEditorProvider>")
  return ctx
}

/* ------------------------------------------------------------------ */
/* Header pieces                                                       */
/* ------------------------------------------------------------------ */

function HeaderIconButton({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function ThemeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { accent, setAccent, touch } = useFormEditor()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>Theme</DialogTitle>
          <DialogDescription>
            The colour shows on this form&apos;s header, active question and Submit button.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Colour</span>
            <ThemePicker
              value={accent}
              onValueChange={(a) => {
                setAccent(a)
                touch()
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Header image</span>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => toast("Image picker opens here")}
            >
              <ImageIcon data-icon="inline-start" />
              Choose image
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const TABS = [
  { seg: "edit", label: "Questions" },
  { seg: "responses", label: "Responses" },
  { seg: "settings", label: "Settings" },
] as const

function EditorHeader({
  shareOpen,
  setShareOpen,
}: {
  shareOpen: boolean
  setShareOpen: (o: boolean) => void
}) {
  const { formId, publicLink, name, setName, status, touch, responseCount } = useFormEditor()
  const pathname = usePathname()
  const router = useRouter()
  const [themeOpen, setThemeOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const onQuestions = pathname.endsWith("/edit")

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex min-h-header flex-wrap items-center gap-3 px-3 py-2">
        <HeaderIconButton label="Back to dashboard" asChild>
          <Link href="/dashboard">
            <ArrowLeftIcon />
          </Link>
        </HeaderIconButton>
        <span
          aria-hidden="true"
          className="grid size-8 flex-none place-items-center rounded-lg bg-form-accent text-on-form-accent"
        >
          <FileTextIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-[1_1_200px] flex-col">
          <label htmlFor="form-name" className="sr-only">
            Form name
          </label>
          <input
            id="form-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              touch()
            }}
            className="w-full max-w-90 rounded-sm border-b border-transparent bg-transparent text-base leading-[22px] font-semibold outline-none hover:border-border focus:border-form-accent"
          />
          <SaveStatus status={status} />
        </div>
        <div className="flex items-center gap-1">
          {onQuestions ? (
            <HeaderIconButton label="Customize theme" onClick={() => setThemeOpen(true)}>
              <PaletteIcon />
            </HeaderIconButton>
          ) : null}
          <HeaderIconButton label="Preview" asChild>
            <Link href={`/forms/${formId}/preview`}>
              <EyeIcon />
            </Link>
          </HeaderIconButton>
          <Button className="ml-1" onClick={() => setShareOpen(true)}>
            <SendIcon data-icon="inline-start" />
            Send
          </Button>
          <DropdownMenu modal={false}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More form actions">
                    <EllipsisVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>More</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-55">
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => toast(`Copy of “${name}” created`)}>
                  <CopyIcon />
                  Make a copy
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast("Undo arrives with editor history")}>
                  <Undo2Icon />
                  Undo last change
                  <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => window.print()}>
                  <PrinterIcon />
                  Print
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2Icon />
                Delete form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UserMenu />
        </div>
      </div>

      <nav aria-label="Form views" className="flex justify-center pb-2.5">
        <div className="inline-flex h-9 items-center rounded-lg bg-muted p-[3px] text-muted-foreground">
          {TABS.map((t) => {
            const href = `/forms/${formId}/${t.seg}`
            const current = pathname === href
            return (
              <Link
                key={t.seg}
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-full items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-[color,box-shadow] outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  current && "bg-background text-foreground shadow-sm dark:bg-input/30"
                )}
              >
                {t.label}
                {t.seg === "responses" && responseCount ? (
                  <Badge variant="secondary" className="px-1.5 tabular-nums">
                    {responseCount}
                  </Badge>
                ) : null}
              </Link>
            )
          })}
        </div>
      </nav>

      <ThemeDialog open={themeOpen} onOpenChange={setThemeOpen} />
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        link={publicLink}
        owner={MOCK_USER}
        collaborators={[{ name: "Hodan Abdi", email: "hodan@example.com" }]}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete “${name}”?`}
        description={`This removes the form and its ${responseCount} responses. You can't undo this.`}
        confirmLabel="Delete form"
        onConfirm={() => {
          toast(`“${name}” deleted`)
          router.push("/dashboard")
        }}
      />
    </header>
  )
}

/* ------------------------------------------------------------------ */

/** Wraps the Questions, Responses and Settings tabs with the shared editor header. */
function FormEditorProvider({ formId, children }: { formId: string; children: React.ReactNode }) {
  const isNew = formId === "new"
  const [name, setName] = React.useState(isNew ? "Untitled form" : MOCK_EDITOR_FORM.name)
  const [accent, setAccent] = React.useState<Accent>(MOCK_EDITOR_FORM.accent)
  const [font, setFont] = React.useState<FormFont>("default")
  const [status, setStatus] = React.useState<SaveState>("saved")
  const [shareOpen, setShareOpen] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const touch = React.useCallback(() => {
    setStatus("saving")
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus("saved"), 800)
  }, [])

  // Show "offline" when the browser loses its connection.
  React.useEffect(() => {
    const off = () => setStatus("offline")
    const on = () => setStatus("saved")
    window.addEventListener("offline", off)
    window.addEventListener("online", on)
    return () => {
      window.removeEventListener("offline", off)
      window.removeEventListener("online", on)
    }
  }, [])

  const value: FormEditorState = {
    formId,
    publicLink: `https://formly.example/f/${MOCK_EDITOR_FORM.publicId}`,
    name,
    setName,
    accent,
    setAccent,
    font,
    setFont,
    draft: isNew ? NEW_FORM_DRAFT : MOCK_EDITOR_FORM.draft,
    responseCount: isNew ? 0 : MOCK_EDITOR_FORM.responseCount,
    status,
    setStatus,
    touch,
    openShare: () => setShareOpen(true),
  }

  return (
    <FormEditorContext.Provider value={value}>
      <div data-accent={accent} className="flex min-h-svh flex-col bg-background">
        <EditorHeader shareOpen={shareOpen} setShareOpen={setShareOpen} />
        <main className="flex-1 bg-muted px-4 pt-6 pb-24">{children}</main>
      </div>
    </FormEditorContext.Provider>
  )
}

export { FormEditorProvider }
