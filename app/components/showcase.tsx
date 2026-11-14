"use client"

import * as React from "react"
import { EyeIcon, FileTextIcon, MoonIcon, PlusIcon, SendIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { AppHeader } from "@/components/formly/app-header"
import { ConfirmDialog } from "@/components/formly/confirm-dialog"
import { FloatingToolbar } from "@/components/formly/floating-toolbar"
import { FormBuilder } from "@/components/formly/form-builder"
import { FormCard } from "@/components/formly/form-card"
import { ACCENTS, SAMPLE_FORM, makeQuestion, type Accent, type Question } from "@/components/formly/form-data"
import { FormHeaderCard } from "@/components/formly/form-header-card"
import { Logo, LogoMark } from "@/components/formly/logo"
import { QuestionCard } from "@/components/formly/question-card"
import { RespondentForm } from "@/components/formly/respondent-form"
import { RespondentQuestion, type AnswerValue } from "@/components/formly/respondent-question"
import { ResponseSummaryCard } from "@/components/formly/response-summary-card"
import { SaveStatus, type SaveState } from "@/components/formly/save-status"
import { ShareDialog } from "@/components/formly/share-dialog"
import { ThemePicker } from "@/components/formly/theme-picker"
import { UserAvatar } from "@/components/formly/user-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const USER = { name: "Joseph Abdullahi", email: "joseph@example.com" }

/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t py-10 first:border-t-0">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-6 flex flex-col gap-8">{children}</div>
    </section>
  )
}

function Demo({ title, children, muted }: { title: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className={muted ? "rounded-xl border bg-muted p-4 sm:p-6" : "rounded-xl border p-4 sm:p-6"}>
        {children}
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {/* CSS picks the icon so server and client markup match. */}
          <SunIcon className="hidden dark:block" />
          <MoonIcon className="dark:hidden" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle theme (D)</TooltipContent>
    </Tooltip>
  )
}

/* ------------------------------------------------------------------ */
/* Foundations                                                         */
/* ------------------------------------------------------------------ */

const COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "primary",
  "secondary",
  "muted",
  "muted-foreground",
  "accent",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
]

function Foundations() {
  return (
    <>
      <Demo title="Colour tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {COLOR_TOKENS.map((t) => (
            <div key={t} className="flex flex-col gap-1.5">
              <div className="h-12 rounded-md border" style={{ background: `var(--${t})` }} />
              <code className="font-mono text-xs">{t}</code>
            </div>
          ))}
        </div>
      </Demo>
      <Demo title="Form accents (only on a form's own surfaces)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACCENTS.map((a) => (
            <div
              key={a}
              data-accent={a}
              className="flex h-12 items-center rounded-md bg-form-accent px-3 text-sm font-medium text-on-form-accent"
            >
              form-{a}
            </div>
          ))}
        </div>
      </Demo>
      <Demo title="Type: Geist and Geist Mono">
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-bold tracking-[-0.025em]">Forms people finish.</p>
          <p className="text-3xl leading-9 font-semibold tracking-[-0.025em]">Event registration</p>
          <p className="text-2xl font-semibold">Recent forms</p>
          <p className="text-lg font-semibold">Will you attend in person?</p>
          <p className="text-base">What is your full name?</p>
          <p className="text-sm">Changes save automatically.</p>
          <p className="text-sm font-medium">Collect email addresses</p>
          <p className="text-xs text-muted-foreground">Opened 3 Oct · 42 responses</p>
          <p className="font-mono text-xs">/f/k3Jd9aQ2xP7z</p>
          <p className="font-serif text-base">Serif form font: Source Serif 4</p>
        </div>
      </Demo>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function Primitives() {
  const [password, setPassword] = React.useState("pass")
  const [saving, setSaving] = React.useState(false)

  return (
    <>
      <Demo title="Button">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <SendIcon data-icon="inline-start" />
              Send
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">
              <EyeIcon data-icon="inline-start" />
              Preview
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete form</Button>
            <Button variant="link">Link</Button>
            <span data-accent="emerald">
              <Button variant="accent">Submit</Button>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra large</Button>
            <Button size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => {
                setSaving(true)
                setTimeout(() => {
                  setSaving(false)
                  toast.success("Saved")
                }, 1200)
              }}
            >
              {saving ? <Spinner data-icon="inline-start" /> : null}
              Save
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Demo>

      <div className="grid gap-8 lg:grid-cols-2">
        <Demo title="Input and Textarea (with Field)">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="demo-email">Email</FieldLabel>
              <Input id="demo-email" type="email" placeholder="you@example.com" />
              <FieldDescription>We only use this to sign you in.</FieldDescription>
            </Field>
            <Field data-invalid={password.length < 8 || undefined}>
              <FieldLabel htmlFor="demo-password">Password</FieldLabel>
              <Input
                id="demo-password"
                type="password"
                value={password}
                aria-invalid={password.length < 8}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password.length < 8 ? (
                <FieldError>Use at least 8 characters</FieldError>
              ) : (
                <FieldDescription>Looks good.</FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="demo-confirm">Confirmation message</FieldLabel>
              <Textarea id="demo-confirm" defaultValue="Your response has been recorded." />
            </Field>
          </FieldGroup>
        </Demo>

        <Demo title="Checkbox, RadioGroup, Switch, Select">
          <FieldGroup>
            <div className="flex items-center gap-3">
              <Checkbox id="demo-cb" defaultChecked />
              <Label htmlFor="demo-cb">Collect email addresses</Label>
            </div>
            <RadioGroup defaultValue="immediate" aria-label="Release grade">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="immediate" id="r1" />
                <Label htmlFor="r1">Immediately after each submission</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="manual" id="r2" />
                <Label htmlFor="r2">Later, after manual review</Label>
              </div>
            </RadioGroup>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="demo-switch">Accepting responses</Label>
                <p className="text-xs text-muted-foreground">Respondents can open and submit the form.</p>
              </div>
              <Switch id="demo-switch" defaultChecked />
            </div>
            <Select defaultValue="updated">
              <SelectTrigger aria-label="Sort forms" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="updated">Last modified</SelectItem>
                  <SelectItem value="opened">Last opened by me</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldGroup>
        </Demo>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Demo title="DropdownMenu, Tooltip, Dialog, ConfirmDialog, Toast">
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Options</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Preview">
                  <EyeIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename form</DialogTitle>
                  <DialogDescription>Respondents see the new name on the form.</DialogDescription>
                </DialogHeader>
                <Field>
                  <FieldLabel htmlFor="dlg-name">Form name</FieldLabel>
                  <Input id="dlg-name" defaultValue="Meetup registration" />
                </Field>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button>Rename</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <ConfirmDialog
              trigger={<Button variant="outline">Delete responses</Button>}
              title="Delete all 42 responses?"
              description="This removes every response to this form. You can't undo this."
              confirmLabel="Delete responses"
              onConfirm={() => toast("42 responses deleted")}
            />
            <Button
              variant="outline"
              onClick={() =>
                toast("Question deleted", { action: { label: "Undo", onClick: () => toast("Restored") } })
              }
            >
              Show toast
            </Button>
          </div>
        </Demo>

        <Demo title="Badge, Avatar, Skeleton">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">42 responses</Badge>
              <Badge variant="outline">Quiz</Badge>
              <Badge variant="destructive">Closed</Badge>
            </div>
            <div className="flex items-center gap-2">
              <UserAvatar user={USER} />
              <UserAvatar user={{ name: "Hodan Abdi", email: "" }} size={40} />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </div>
        </Demo>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Demo title="Tabs: pill (editor views) and line (Responses sub-views)">
          <div className="flex flex-col gap-6">
            <Tabs defaultValue="questions">
              <TabsList>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="responses">
                  Responses <Badge variant="secondary">42</Badge>
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue="summary">
              <TabsList variant="line">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="question">Question</TabsTrigger>
                <TabsTrigger value="individual">Individual</TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="pt-3 text-sm text-muted-foreground">
                Summary panel
              </TabsContent>
              <TabsContent value="question" className="pt-3 text-sm text-muted-foreground">
                Question panel
              </TabsContent>
              <TabsContent value="individual" className="pt-3 text-sm text-muted-foreground">
                Individual panel
              </TabsContent>
            </Tabs>
          </div>
        </Demo>

        <Demo title="Card and Empty">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Responses</CardTitle>
                <CardDescription>Manage how responses are collected.</CardDescription>
                <CardAction>
                  <Switch aria-label="Accepting responses" defaultChecked />
                </CardAction>
              </CardHeader>
              <CardContent className="text-sm">Accepting responses</CardContent>
              <CardFooter className="text-xs text-muted-foreground">Changes apply at once.</CardFooter>
            </Card>
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileTextIcon />
                </EmptyMedia>
                <EmptyTitle>No forms yet</EmptyTitle>
                <EmptyDescription>Create a form to start collecting responses.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button>
                  <PlusIcon data-icon="inline-start" />
                  Blank form
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        </Demo>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Formly components                                                   */
/* ------------------------------------------------------------------ */

function FormlyComponents() {
  const [status, setStatus] = React.useState<SaveState>("saved")
  const [accent, setAccent] = React.useState<Accent>("violet")
  const [header, setHeader] = React.useState({ title: "Event registration", description: "" })
  const [qs, setQs] = React.useState<Question[]>(() => [
    SAMPLE_FORM.questions[1],
    makeQuestion("SHORT_ANSWER", { id: "q-short", title: "Full name", required: true }),
  ])
  const [activeQ, setActiveQ] = React.useState(qs[0].id)
  const [rq, setRq] = React.useState<Record<string, AnswerValue>>({})

  return (
    <>
      <Demo title="Logo">
        <div className="flex flex-wrap items-center gap-8">
          <Logo size={28} />
          <Logo size={32} />
          <LogoMark size={64} />
          <LogoMark size={16} />
        </div>
      </Demo>

      <Demo title="AppHeader with UserMenu (Appearance switches the theme)">
        <div className="-m-4 overflow-hidden rounded-xl sm:-m-6">
          <AppHeader
            user={USER}
            className="static"
            actions={
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Help
              </Button>
            }
            onNavigate={(where) => toast(`Navigate: ${where}`)}
            onSignOut={() => toast("Signed out")}
          />
        </div>
      </Demo>

      <div className="grid gap-8 lg:grid-cols-2">
        <Demo title="SaveStatus">
          <div className="flex flex-col gap-3">
            <SaveStatus status="saving" />
            <SaveStatus status="saved" />
            <SaveStatus status="offline" />
            <SaveStatus status="error" />
          </div>
        </Demo>
        <Demo title="ThemePicker">
          <div className="flex flex-col gap-4">
            <ThemePicker value={accent} onValueChange={setAccent} />
            <div data-accent={accent} className="h-10 w-40 overflow-hidden rounded-md border bg-card">
              <div className="h-2 bg-form-accent" />
            </div>
          </div>
        </Demo>
      </div>

      <Demo title="FormHeaderCard (editable) and FloatingToolbar" muted>
        <div className="flex items-start gap-4">
          <FormHeaderCard
            className="flex-1"
            accent={accent}
            title={header.title}
            description={header.description}
            onChange={(p) => setHeader((h) => ({ ...h, ...p }))}
          />
          <FloatingToolbar
            className="hidden sm:inline-flex"
            onAddQuestion={() => toast("Add question")}
          />
        </div>
      </Demo>

      <Demo title="QuestionCard: active and inactive. Click the second card to activate it." muted>
        <div className="mx-auto flex max-w-editor flex-col gap-3">
          {qs.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              accent={accent}
              active={activeQ === q.id}
              onActivate={() => setActiveQ(q.id)}
              onChange={(next) => setQs((list) => list.map((x) => (x.id === q.id ? next : x)))}
              onDuplicate={() => toast("Duplicate")}
              onDelete={() => toast("Delete")}
            />
          ))}
        </div>
      </Demo>

      <Demo title="FormBuilder: the whole Questions tab (drag the grips to reorder)" muted>
        <div className="mb-3 flex justify-end">
          <SaveStatus status={status} />
        </div>
        {/* Toolbar off here: on phones it is fixed to the viewport and would cover the
            rest of the showcase. FloatingToolbar has its own demo above. */}
        <FormBuilder
          form={SAMPLE_FORM}
          accent={accent}
          defaultActive={1}
          onStatusChange={setStatus}
          showToolbar={false}
        />
      </Demo>

      <Demo title="FormCard (dashboard grid)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormCard title="Meetup registration" responses={42} edited="Edited 2 hours ago" />
          <FormCard title="Networking basics quiz" accent="blue" status="quiz" edited="Edited 3 Oct" />
          <FormCard title="Lab group sign-up" accent="orange" status="closed" edited="Edited 28 Sep" />
          <FormCard title="Untitled form" accent="emerald" edited="Edited today" />
        </div>
      </Demo>

      <Demo title="ResponseSummaryCard" muted>
        <div className="mx-auto flex max-w-180 flex-col gap-3">
          <ResponseSummaryCard
            title="Will you attend in person?"
            total={42}
            kind="pie"
            data={[
              { label: "Yes, in person", count: 30 },
              { label: "Online, via the stream", count: 9 },
              { label: "Not sure yet", count: 3 },
            ]}
          />
          <ResponseSummaryCard
            title="Which sessions will you join?"
            total={42}
            answered={40}
            note="People could pick more than one"
            kind="bars"
            data={[
              { label: "Lightning talks", count: 31 },
              { label: "BGP route filtering workshop", count: 28 },
              { label: "IPv6 deployment panel", count: 22 },
            ]}
          />
          <ResponseSummaryCard
            title="How familiar are you with BGP?"
            total={42}
            kind="scale"
            average="3.3"
            minLabel="New to it"
            maxLabel="Run it daily"
            data={[
              { label: "1", count: 3 },
              { label: "2", count: 7 },
              { label: "3", count: 14 },
              { label: "4", count: 12 },
              { label: "5", count: 6 },
            ]}
          />
          <ResponseSummaryCard
            title="Full name"
            total={42}
            kind="list"
            data={[
              { label: "Hodan Abdi", count: 1 },
              { label: "Ahmed Warsame", count: 1 },
              { label: "Faisal Nur", count: 1 },
              { label: "Sahra Ali", count: 1 },
              { label: "Mohamed Yusuf", count: 1 },
            ]}
          />
        </div>
      </Demo>

      <Demo title="RespondentQuestion">
        <div data-accent={accent} className="mx-auto flex max-w-respondent flex-col gap-3">
          <RespondentQuestion
            question={SAMPLE_FORM.questions[1]}
            value={rq.a}
            onChange={(v) => setRq((s) => ({ ...s, a: v }))}
          />
          <RespondentQuestion
            question={SAMPLE_FORM.questions[0]}
            value={rq.b}
            onChange={(v) => setRq((s) => ({ ...s, b: v }))}
            error={rq.b ? undefined : "This is a required question"}
          />
        </div>
      </Demo>

      <Demo title="RespondentForm: press Submit empty, then fill it in">
        <div className="-m-4 overflow-hidden rounded-xl sm:-m-6">
          <RespondentForm form={SAMPLE_FORM} accent={accent} collectEmail />
        </div>
      </Demo>

      <Demo title="ShareDialog">
        <ShareDialog
          trigger={
            <Button>
              <SendIcon data-icon="inline-start" />
              Send
            </Button>
          }
          link="https://formly.example/f/k3Jd9aQ2xP7z"
          owner={USER}
          collaborators={[{ name: "Hodan Abdi", email: "hodan@example.com" }]}
        />
      </Demo>
    </>
  )
}

/* ------------------------------------------------------------------ */

const NAV = [
  { id: "foundations", label: "Foundations" },
  { id: "primitives", label: "Primitives" },
  { id: "formly", label: "Formly" },
]

export function Showcase() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <Logo size={24} href="/components" />
        <span className="hidden text-sm text-muted-foreground sm:inline">Components</span>
        <nav aria-label="Sections" className="ml-auto flex items-center gap-1">
          {NAV.map((n) => (
            <Button key={n.id} variant="ghost" size="sm" asChild>
              <a href={`#${n.id}`}>{n.label}</a>
            </Button>
          ))}
        </nav>
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-dashboard px-4 pb-24 sm:px-6">
        <Section
          id="foundations"
          title="Foundations"
          description="shadcn new-york on the Neutral base. Each form's accent is the only hue on screen."
        >
          <Foundations />
        </Section>
        <Section id="primitives" title="Primitives" description="shadcn/ui components as installed in components/ui.">
          <Primitives />
        </Section>
        <Section
          id="formly"
          title="Formly components"
          description="Product components in components/formly. They hold UI state only; the screens will pass data and handlers in."
        >
          <FormlyComponents />
        </Section>
      </main>
    </div>
  )
}
