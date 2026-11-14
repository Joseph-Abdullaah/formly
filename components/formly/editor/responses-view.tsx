"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  InboxIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/formly/confirm-dialog"
import { useFormEditor } from "@/components/formly/editor/form-editor"
import { ResponseSummaryCard, type SummaryDatum } from "@/components/formly/response-summary-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

/* ------------------------------------------------------------------ */
/* Mock responses (replace with GET /api/forms/[id]/responses)         */
/* ------------------------------------------------------------------ */

interface MockResponse {
  id: number
  time: string
  email: string
  name: string
  attend: string
  sessions: string
  bgp: string
  notes: string
}

const MOCK_RESPONSES: MockResponse[] = [
  { id: 1, time: "9 Oct, 09:41", email: "hodan@example.com", name: "Hodan Abdi", attend: "Yes, in person", sessions: "BGP workshop, Lightning talks", bgp: "3", notes: "Could the slides be shared after the workshop?" },
  { id: 2, time: "9 Oct, 09:12", email: "mohamed.w@example.com", name: "Mohamed Warsame", attend: "Online, via the stream", sessions: "IPv6 panel", bgp: "4", notes: "" },
  { id: 3, time: "8 Oct, 21:30", email: "ayaan@example.com", name: "Ayaan Yusuf", attend: "Yes, in person", sessions: "BGP workshop", bgp: "2", notes: "I'll arrive around 17:30 after work." },
  { id: 4, time: "8 Oct, 18:02", email: "abdirahman@example.com", name: "Abdirahman Farah", attend: "Yes, in person", sessions: "Lightning talks, IPv6 panel", bgp: "5", notes: "Happy to give a lightning talk on our IXP setup." },
  { id: 5, time: "8 Oct, 16:45", email: "sahra@example.com", name: "Sahra Ali", attend: "Not sure yet", sessions: "Lightning talks", bgp: "1", notes: "" },
  { id: 6, time: "8 Oct, 11:20", email: "yusuf.h@example.com", name: "Yusuf Hassan", attend: "Yes, in person", sessions: "BGP workshop, IPv6 panel, Lightning talks", bgp: "4", notes: "" },
  { id: 7, time: "7 Oct, 22:05", email: "amina@example.com", name: "Amina Omar", attend: "Online, via the stream", sessions: "BGP workshop", bgp: "3", notes: "Is there parking at the venue?" },
  { id: 8, time: "7 Oct, 19:48", email: "khalid@example.com", name: "Khalid Mahamud", attend: "Yes, in person", sessions: "Lightning talks", bgp: "3", notes: "" },
]

/** Aggregates across all 42 mock responses (only 8 are listed individually). */
const MOCK_SUMMARY = {
  attend: [
    { label: "Yes, in person", count: 30 },
    { label: "Online, via the stream", count: 9 },
    { label: "Not sure yet", count: 3 },
  ],
  sessions: [
    { label: "Lightning talks", count: 31 },
    { label: "BGP route filtering workshop", count: 28 },
    { label: "IPv6 deployment panel", count: 22 },
  ],
  scale: [
    { label: "1", count: 3 },
    { label: "2", count: 7 },
    { label: "3", count: 14 },
    { label: "4", count: 12 },
    { label: "5", count: 6 },
  ],
}

const QUESTIONS = [
  "Full name",
  "Will you attend in person?",
  "Which sessions will you join?",
  "How familiar are you with BGP?",
  "Anything you'd like the organisers to know?",
]

type View = "summary" | "question" | "individual" | "table"

/* ------------------------------------------------------------------ */

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className ?? ""}`}>
      {children}
    </section>
  )
}

function SummaryView({ rows, count }: { rows: MockResponse[]; count: number }) {
  const notes = rows.filter((r) => r.notes)
  return (
    <div className="flex flex-col gap-3">
      <ResponseSummaryCard
        title="Full name"
        total={count}
        kind="list"
        data={rows.map((r) => ({ label: r.name, count: 1 }))}
      />
      <ResponseSummaryCard title="Will you attend in person?" total={count} kind="pie" data={MOCK_SUMMARY.attend} />
      <ResponseSummaryCard
        title="Which sessions will you join?"
        total={count}
        answered={Math.max(0, count - 2)}
        note="People could pick more than one"
        kind="bars"
        data={MOCK_SUMMARY.sessions}
      />
      <ResponseSummaryCard
        title="How familiar are you with BGP?"
        total={count}
        kind="scale"
        average="3.3"
        minLabel="New to it"
        maxLabel="Run it daily"
        data={MOCK_SUMMARY.scale}
      />
      <ResponseSummaryCard
        title="Anything you'd like the organisers to know?"
        total={count}
        answered={11}
        kind="list"
        data={notes.map((r) => ({ label: r.notes, count: 1 }))}
      />
    </div>
  )
}

function QuestionView({ rows }: { rows: MockResponse[] }) {
  const [q, setQ] = React.useState(1)
  const pct = (n: number, of: number) => `${n} (${Math.round((n / of) * 100)}%)`
  const grouped: { note: string; items: { label: string; meta: string }[] }[] = [
    { note: "42 responses, latest first", items: rows.map((r) => ({ label: r.name, meta: r.time })) },
    { note: "42 responses, grouped by answer", items: MOCK_SUMMARY.attend.map((d) => ({ label: d.label, meta: pct(d.count, 42) })) },
    { note: "40 responses, grouped by answer", items: MOCK_SUMMARY.sessions.map((d) => ({ label: d.label, meta: pct(d.count, 42) })) },
    {
      note: "42 responses, grouped by answer",
      items: [...MOCK_SUMMARY.scale]
        .sort((a, b) => b.count - a.count)
        .map((d: SummaryDatum) => ({
          label: d.label === "1" ? "1 New to it" : d.label === "5" ? "5 Run it daily" : d.label,
          meta: String(d.count),
        })),
    },
    { note: "11 responses, latest first", items: rows.filter((r) => r.notes).map((r) => ({ label: r.notes, meta: r.name })) },
  ]
  const g = grouped[q]
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(q)} onValueChange={(v) => setQ(Number(v))}>
          <SelectTrigger aria-label="Question" className="w-full sm:w-85">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTIONS.map((label, i) => (
              <SelectItem key={label} value={String(i)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex-1" />
        <Button variant="outline" size="icon-sm" aria-label="Previous question" onClick={() => setQ((q + 4) % 5)}>
          <ChevronLeftIcon />
        </Button>
        <span className="min-w-12 text-center text-xs text-muted-foreground tabular-nums">{q + 1} of 5</span>
        <Button variant="outline" size="icon-sm" aria-label="Next question" onClick={() => setQ((q + 1) % 5)}>
          <ChevronRightIcon />
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{g.note}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {g.items.map((a, i) => (
          <li key={i} className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2.5 text-sm">
            <span>{a.label}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{a.meta}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function IndividualView({
  rows,
  count,
  onDelete,
}: {
  rows: MockResponse[]
  count: number
  onDelete: (r: MockResponse) => void
}) {
  const [i, setI] = React.useState(0)
  const [confirm, setConfirm] = React.useState(false)
  const idx = Math.min(i, rows.length - 1)
  const cur = rows[idx]
  if (!cur) return null
  const answers = [
    ["Full name", cur.name],
    ["Will you attend in person?", cur.attend],
    ["Which sessions will you join?", cur.sessions],
    ["How familiar are you with BGP?", `${cur.bgp} of 5`],
    ["Anything you'd like the organisers to know?", cur.notes || "No answer"],
  ]
  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-wrap items-center gap-2 px-4 py-3.5">
        <Button variant="outline" size="icon-sm" aria-label="Previous response" disabled={idx === 0} onClick={() => setI(idx - 1)}>
          <ChevronLeftIcon />
        </Button>
        <span className="text-sm font-medium tabular-nums" aria-live="polite">
          {idx + 1} of {count}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next response"
          disabled={idx >= rows.length - 1}
          onClick={() => setI(idx + 1)}
        >
          <ChevronRightIcon />
        </Button>
        <span className="flex-1" />
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirm(true)}>
          <Trash2Icon data-icon="inline-start" />
          Delete response
        </Button>
      </Card>
      <section className="relative overflow-hidden rounded-lg border bg-card px-6 pt-7 pb-5 shadow-sm before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-form-accent">
        <p className="text-xs text-muted-foreground">Submitted {cur.time}</p>
        <p className="mt-1 text-lg font-semibold">{cur.name}</p>
        <p className="text-sm text-muted-foreground">{cur.email}</p>
      </section>
      {answers.map(([q, v]) => (
        <Card key={q} className="px-6 py-5">
          <p className="text-base">{q}</p>
          <p className="mt-2.5 rounded-r-md border-l-[3px] border-form-accent bg-muted px-3 py-2 text-sm">{v}</p>
        </Card>
      ))}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this response?"
        description={`This removes ${cur.name}'s response. You can't undo this.`}
        confirmLabel="Delete response"
        onConfirm={() => onDelete(cur)}
      />
    </div>
  )
}

function TableView({ rows, count }: { rows: MockResponse[]; count: number }) {
  return (
    <Card className="overflow-hidden">
      <Table className="min-w-245">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Submitted</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Full name</TableHead>
            <TableHead>Attend in person?</TableHead>
            <TableHead>Sessions</TableHead>
            <TableHead>BGP</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="pl-5 text-muted-foreground tabular-nums">{r.time}</TableCell>
              <TableCell>{r.email}</TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.attend}</TableCell>
              <TableCell>{r.sessions}</TableCell>
              <TableCell className="tabular-nums">{r.bgp}</TableCell>
              <TableCell className="max-w-65 truncate">{r.notes || "–"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
        <span className="text-xs text-muted-foreground">
          Showing 1–{rows.length} of {count}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast("Page 2 of 6")}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */

/** Editor → Responses tab. */
function ResponsesView() {
  const { name, responseCount, openShare } = useFormEditor()
  const [rows, setRows] = React.useState(responseCount ? MOCK_RESPONSES : [])
  const [count, setCount] = React.useState(responseCount)
  const [view, setView] = React.useState<View>("summary")
  const [accepting, setAccepting] = React.useState(true)
  const [notify, setNotify] = React.useState(false)
  const [deleteAll, setDeleteAll] = React.useState(false)

  const fileName = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-responses.csv`

  return (
    <div className="mx-auto flex w-full max-w-200 flex-col gap-3">
      <Card className="px-6 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">
            <span className="tabular-nums">{count}</span> {count === 1 ? "response" : "responses"}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={!count} onClick={() => toast(`Downloaded ${fileName}`)}>
              <DownloadIcon data-icon="inline-start" />
              Export CSV
            </Button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="More response actions">
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-65">
                <DropdownMenuCheckboxItem
                  checked={notify}
                  onCheckedChange={(v) => {
                    setNotify(v)
                    toast(v ? "You will get an email for each new response" : "Email notifications off")
                  }}
                >
                  Get email notifications for new responses
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" disabled={!count} onSelect={() => setDeleteAll(true)}>
                  <Trash2Icon />
                  Delete all responses
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted px-4 py-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="accepting">Accepting responses</Label>
              <p id="accepting-d" className="text-sm text-muted-foreground">
                {accepting
                  ? "Anyone with the link can respond. Last response 18 minutes ago."
                  : "The form is closed. Visitors see your message instead of the questions."}
              </p>
            </div>
            <Switch
              id="accepting"
              aria-describedby="accepting-d"
              checked={accepting}
              onCheckedChange={(v) => {
                setAccepting(v)
                toast(v ? "Accepting responses" : "No longer accepting responses")
              }}
            />
          </div>
          {!accepting ? (
            <Field className="mt-3">
              <FieldLabel htmlFor="closed-msg">Message for respondents</FieldLabel>
              <Textarea
                id="closed-msg"
                rows={2}
                className="bg-background"
                defaultValue="All seats for this meetup are taken. See you next month."
              />
              <FieldDescription>Shown on the closed form page.</FieldDescription>
            </Field>
          ) : null}
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as View)} className="mt-2">
          <TabsList variant="line" aria-label="Response views">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="question">Question</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      {count === 0 ? (
        <Empty className="rounded-lg border bg-card py-12 shadow-sm">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>Waiting for responses</EmptyTitle>
            <EmptyDescription>
              Send the form link to people. Their answers show up here as charts and a table the moment they submit.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={openShare}>
              <SendIcon data-icon="inline-start" />
              Send form
            </Button>
          </EmptyContent>
        </Empty>
      ) : view === "summary" ? (
        <SummaryView rows={rows} count={count} />
      ) : view === "question" ? (
        <QuestionView rows={rows} />
      ) : view === "individual" ? (
        <IndividualView
          rows={rows}
          count={count}
          onDelete={(r) => {
            setRows((list) => list.filter((x) => x.id !== r.id))
            setCount((c) => Math.max(0, c - 1))
            toast("Response deleted")
          }}
        />
      ) : (
        <TableView rows={rows} count={count} />
      )}

      <ConfirmDialog
        open={deleteAll}
        onOpenChange={setDeleteAll}
        title="Delete all responses?"
        description={`This removes all ${count} responses to this form. You can't undo this.`}
        confirmLabel="Delete all responses"
        onConfirm={() => {
          setRows([])
          setCount(0)
          toast("All responses deleted")
        }}
      />
    </div>
  )
}

export { ResponsesView }
