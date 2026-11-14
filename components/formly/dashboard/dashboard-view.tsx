"use client"

import * as React from "react"
import Link from "next/link"
import {
  CopyIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { AppHeader } from "@/components/formly/app-header"
import { FormCard, FormThumb } from "@/components/formly/form-card"
import type { Accent } from "@/components/formly/form-data"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/* ------------------------------------------------------------------ */
/* Mock data (replace with GET /api/forms)                             */
/* ------------------------------------------------------------------ */

interface DashboardForm {
  id: string
  title: string
  accent: Accent
  edited: string
  responses: number
  status?: "closed" | "quiz"
  /** Sort keys: higher = more recent. */
  updatedRank: number
  openedRank: number
}

const MOCK_FORMS: DashboardForm[] = [
  { id: "meetup-registration", title: "Meetup registration", accent: "violet", edited: "2 hours ago", responses: 42, updatedRank: 9, openedRank: 9 },
  { id: "session-feedback", title: "Session feedback, day 1", accent: "emerald", edited: "Yesterday", responses: 118, updatedRank: 8, openedRank: 6 },
  { id: "networking-quiz", title: "Networking basics quiz", accent: "blue", edited: "3 Oct", responses: 26, status: "quiz", updatedRank: 7, openedRank: 8 },
  { id: "lab-group-signup", title: "Lab group sign-up", accent: "orange", edited: "28 Sep", responses: 30, status: "closed", updatedRank: 6, openedRank: 3 },
  { id: "course-evaluation", title: "Course evaluation: Web Development", accent: "slate", edited: "21 Sep", responses: 64, updatedRank: 5, openedRank: 7 },
  { id: "volunteer-availability", title: "Volunteer availability", accent: "rose", edited: "14 Sep", responses: 9, updatedRank: 4, openedRank: 4 },
  { id: "untitled", title: "Untitled form", accent: "violet", edited: "2 Sep", responses: 0, updatedRank: 3, openedRank: 2 },
]

const TEMPLATES: { name: string; accent: Accent }[] = [
  { name: "Event registration", accent: "blue" },
  { name: "Feedback survey", accent: "emerald" },
  { name: "Quiz", accent: "amber" },
  { name: "Contact information", accent: "rose" },
  { name: "Course evaluation", accent: "slate" },
]

type Sort = "updated" | "opened" | "title"
type View = "grid" | "list"

/* ------------------------------------------------------------------ */

function NewFormBand() {
  return (
    <section aria-labelledby="new-form" className="bg-muted px-4 pt-6 pb-8 sm:px-6">
      <div className="mx-auto flex max-w-dashboard flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="new-form" className="text-base font-semibold">
            Start a new form
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast("The template gallery arrives with templates")}
          >
            Template gallery
          </Button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          <Link href="/forms/new/edit" className="group flex flex-col gap-2 outline-none">
            <span className="grid h-33 place-items-center rounded-xl border-[1.5px] border-dashed bg-card text-muted-foreground transition-colors group-hover:border-ring group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50">
              <PlusIcon aria-hidden="true" className="size-8 stroke-[1.5]" />
            </span>
            <span className="text-sm font-medium">Blank form</span>
          </Link>
          {TEMPLATES.map((t) => (
            <Link
              key={t.name}
              href="/forms/new/edit"
              data-accent={t.accent}
              className="group flex flex-col gap-2 outline-none"
            >
              <FormThumb className="rounded-xl border transition-colors group-hover:border-ring group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50" />
              <span className="text-sm font-medium">{t.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FormsListTable({ forms, onDelete }: { forms: DashboardForm[]; onDelete: (f: DashboardForm) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Title</TableHead>
            <TableHead>Responses</TableHead>
            <TableHead className="hidden sm:table-cell">Last edited</TableHead>
            <TableHead className="hidden md:table-cell">Owner</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="pl-5">
                <Link
                  href={`/forms/${f.id}/edit`}
                  data-accent={f.accent}
                  className="inline-flex items-center gap-2.5 font-medium underline-offset-4 hover:underline"
                >
                  <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-form-accent" />
                  {f.title}
                </Link>
              </TableCell>
              <TableCell className="tabular-nums">{f.responses || "–"}</TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">{f.edited}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">me</TableCell>
              <TableCell className="text-right">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${f.title}`}>
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-50">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => toast(`“${f.title}” duplicated`)}>
                        <CopyIcon />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/forms/${f.id}/edit`} target="_blank" rel="noreferrer">
                          <ExternalLinkIcon />
                          Open in new tab
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => onDelete(f)}>
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function LoadingGrid() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your forms"
      className="grid grid-cols-[repeat(auto-fill,minmax(208px,1fr))] gap-5"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="h-33 rounded-none" />
          <div className="flex flex-col gap-2.5 px-4 py-3.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** First-run dashboard: no forms yet. */
function DashboardEmpty() {
  return (
    <main className="grid flex-1 place-items-center px-4 py-12">
      <section aria-labelledby="empty-title" className="flex max-w-130 flex-col items-center gap-4 text-center">
        <div
          aria-hidden="true"
          className="flex w-44 flex-col items-start gap-2.5 rounded-xl border border-dashed border-input bg-muted px-5.5 py-6"
        >
          <span className="h-3.5 w-full rounded-full bg-input" />
          <span className="h-3.5 w-2/3 rounded-full bg-input" />
          <span className="size-3.5 rounded-full bg-input" />
        </div>
        <h1 id="empty-title" className="mt-2 text-2xl font-semibold">
          No forms yet
        </h1>
        <p className="text-[15px] leading-6 text-muted-foreground">
          Start from a blank form or a template. Everything you write saves automatically.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/forms/new/edit">
              <PlusIcon data-icon="inline-start" />
              Blank form
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">Browse templates</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

export interface DashboardViewProps {
  /** Mock states for reviewing the design: empty account or loading skeletons. */
  initialState?: "empty" | "loading"
}

/** The signed-in dashboard: new-form band, then recent forms as a grid or list. */
function DashboardView({ initialState }: DashboardViewProps) {
  const [forms, setForms] = React.useState(initialState === "empty" ? [] : MOCK_FORMS)
  const [q, setQ] = React.useState("")
  const [sort, setSort] = React.useState<Sort>("updated")
  const [view, setView] = React.useState<View>("grid")
  const loading = initialState === "loading"

  const query = q.trim().toLowerCase()
  const shown = forms
    .filter((f) => !query || f.title.toLowerCase().includes(query))
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "opened"
          ? b.openedRank - a.openedRank
          : b.updatedRank - a.updatedRank
    )
  const remove = (f: DashboardForm) => {
    setForms((list) => list.filter((x) => x.id !== f.id))
    toast(`“${f.title}” deleted`)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader searchValue={q} onSearchChange={setQ} />

      {forms.length === 0 && !loading ? (
        <DashboardEmpty />
      ) : (
        <>
          <NewFormBand />
          <main className="flex-1 px-4 pt-8 pb-12 sm:px-6">
            <div className="mx-auto flex max-w-dashboard flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">
                  {query ? `Results for “${q.trim()}”` : "Recent forms"}
                </h1>
                <div className="flex items-center gap-2">
                  <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                    <SelectTrigger aria-label="Sort forms" className="w-43">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="updated">Last modified</SelectItem>
                      <SelectItem value="opened">Last opened</SelectItem>
                      <SelectItem value="title">Title A–Z</SelectItem>
                    </SelectContent>
                  </Select>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={view}
                    onValueChange={(v) => v && setView(v as View)}
                    aria-label="View"
                  >
                    <ToggleGroupItem value="grid" aria-label="Grid view">
                      <LayoutGridIcon />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view">
                      <ListIcon />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              {loading ? (
                <LoadingGrid />
              ) : shown.length === 0 ? (
                <div className="rounded-xl border border-dashed px-4 py-12 text-center">
                  <p className="text-sm font-medium">No forms match “{q.trim()}”</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check the spelling or search for a different word.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setQ("")}>
                    Clear search
                  </Button>
                </div>
              ) : view === "grid" ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(208px,1fr))] gap-5">
                  {shown.map((f) => (
                    <FormCard
                      key={f.id}
                      title={f.title}
                      accent={f.accent}
                      edited={`Edited ${f.edited.charAt(0).toLowerCase()}${f.edited.slice(1)}`}
                      responses={f.responses}
                      status={f.status}
                      href={`/forms/${f.id}/edit`}
                      onRename={(title) =>
                        setForms((list) => list.map((x) => (x.id === f.id ? { ...x, title } : x)))
                      }
                      onOpenInNewTab={() => window.open(`/forms/${f.id}/edit`, "_blank", "noopener")}
                      onDelete={() => setForms((list) => list.filter((x) => x.id !== f.id))}
                    />
                  ))}
                </div>
              ) : (
                <FormsListTable forms={shown} onDelete={remove} />
              )}
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export { DashboardView }
