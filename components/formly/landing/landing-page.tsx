"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlignLeftIcon,
  AwardIcon,
  CalendarIcon,
  CheckIcon,
  CircleChevronDownIcon,
  CircleDotIcon,
  ClockIcon,
  CodeIcon,
  DownloadIcon,
  Grid3x3Icon,
  LinkIcon,
  LockIcon,
  PaletteIcon,
  SaveIcon,
  SlidersHorizontalIcon,
  SquareCheckBigIcon,
  SquareCheckIcon,
  TextCursorInputIcon,
  UploadIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { SAMPLE_FORM, makeQuestion, type Accent, type Question } from "@/components/formly/form-data"
import { Logo } from "@/components/formly/logo"
import { QuestionCard } from "@/components/formly/question-card"
import { RespondentForm } from "@/components/formly/respondent-form"
import { ResponseSummaryCard } from "@/components/formly/response-summary-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

type UseCaseKey = "events" | "quizzes" | "feedback"

const USE_CASES: Record<
  UseCaseKey,
  {
    tab: string
    title: string
    body: string
    accent: Accent
    points: string[]
    formTitle: string
    formDesc: string
    question: string
    options: string[]
    selected: number
  }
> = {
  events: {
    tab: "Events",
    title: "Event registration",
    body: "Collect names and emails, cap one response per person, and close the form the moment seats run out.",
    accent: "blue",
    points: ["Collect email addresses automatically", "Limit to one response per person", "Close the form with your own message"],
    formTitle: "Meetup registration",
    formDesc: "12 November, 17:00, Mogadishu.",
    question: "Will you attend in person?",
    options: ["Yes, in person", "Online, via the stream", "Not sure yet"],
    selected: 0,
  },
  quizzes: {
    tab: "Quizzes",
    title: "Class quizzes",
    body: "Mark the correct answers, give each question points, and let students see their score right after they submit.",
    accent: "amber",
    points: ["Answer key and points per question", "Release grades now or after review", "Show missed questions and correct answers"],
    formTitle: "Networking basics quiz",
    formDesc: "Week 4. 10 questions, 20 points.",
    question: "Which protocol exchanges routes between autonomous systems?",
    options: ["OSPF", "BGP", "RIP"],
    selected: 1,
  },
  feedback: {
    tab: "Feedback",
    title: "Feedback surveys",
    body: "Ask how something went with scales and open questions, then read the averages and comments in one place.",
    accent: "emerald",
    points: ["Linear scales with labelled ends", "Paragraph answers grouped for reading", "Export everything to CSV"],
    formTitle: "Session feedback, day 1",
    formDesc: "Two minutes. Anonymous.",
    question: "How useful was the BGP workshop?",
    options: ["Very useful", "Somewhat useful", "Not useful"],
    selected: 0,
  },
}

const QUESTION_TYPES: [LucideIcon, string][] = [
  [TextCursorInputIcon, "Short answer"],
  [AlignLeftIcon, "Paragraph"],
  [CircleDotIcon, "Multiple choice"],
  [SquareCheckIcon, "Checkboxes"],
  [CircleChevronDownIcon, "Dropdown"],
  [SlidersHorizontalIcon, "Linear scale"],
  [Grid3x3Icon, "Choice grid"],
  [Grid3x3Icon, "Checkbox grid"],
  [CalendarIcon, "Date"],
  [ClockIcon, "Time"],
  [UploadIcon, "File upload"],
]

const FEATURES: [LucideIcon, string, string][] = [
  [SaveIcon, "Autosave", "Every edit saves as you type. No Save button, no lost work."],
  [SquareCheckBigIcon, "Required answers and validation", "Mark questions required, check emails, numbers and text length."],
  [AwardIcon, "Quiz mode", "Correct answers, points and instant or reviewed grades."],
  [PaletteIcon, "Themes", "Eight accent colours, a header image and three fonts per form."],
  [UsersIcon, "Collaborators", "Invite editors by email to build a form with you."],
  [CodeIcon, "Embed anywhere", "Copy iframe code to put the form on your own site."],
  [LockIcon, "Close when done", "Stop accepting responses and show your own message."],
  [DownloadIcon, "CSV export", "Download every response as a spreadsheet-ready file."],
]

const FAQS: [string, string][] = [
  ["Do respondents need an account?", "No. Anyone with the link can answer. Turn on “Limit to 1 response” if you need each person to sign in so they can answer only once."],
  ["Can I change a form after sharing it?", "Yes. Edits save straight to the live form. Answers already submitted keep the question text they were given, so your exports stay readable."],
  ["How do I stop people from responding?", "Open the Responses tab and switch off “Accepting responses”. Visitors then see your closed message instead of the questions."],
  ["Can I get my data out?", "Export all responses to CSV at any time, one column per question, ready for a spreadsheet."],
  ["Can someone help me build a form?", "Invite collaborators by email from the Send dialog. They can edit questions and settings; only you can delete the form."],
  ["Where are responses stored?", "In a PostgreSQL database. Formly never stores respondents’ IP addresses, and only stores an email when the form collects one."],
]

const DEMO_RESULTS = [
  { label: "Yes, in person", count: 30 },
  { label: "Online, via the stream", count: 9 },
  { label: "Not sure yet", count: 3 },
]

/* ------------------------------------------------------------------ */

function H2({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <h2 id={id} className={cn("text-3xl leading-9 font-semibold tracking-[-0.025em] text-balance", className)}>
      {children}
    </h2>
  )
}

function Dot({ on }: { on?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-4 flex-none rounded-full border-2",
        on ? "border-form-accent bg-[radial-gradient(circle,var(--form-accent)_0_36%,transparent_40%)]" : "border-input"
      )}
    />
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-300 items-center gap-4 px-4 sm:px-6">
        <Logo href="/" size={28} />
        <nav aria-label="Sections" className="ml-6 hidden items-center gap-1 md:flex">
          {[
            ["#uses", "Use cases"],
            ["#try", "Try it"],
            ["#features", "Features"],
            ["#faq", "FAQ"],
          ].map(([href, label]) => (
            <Button key={href} asChild variant="ghost" size="sm">
              <a href={href}>{label}</a>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Create a form</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

/** Hero illustration: a question being written, its share link and the result. */
function HeroArt() {
  return (
    <div
      role="img"
      aria-label="Formly at work: a question being written, its share link, and the results"
      data-accent="violet"
      className="relative flex min-w-0 flex-[1_1_420px] flex-col gap-4"
    >
      <div className="relative rounded-lg border bg-card p-5 shadow-md before:absolute before:-inset-y-px before:-left-px before:w-1.5 before:rounded-l-lg before:bg-form-accent">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1 rounded-t-md border-b-2 border-form-accent bg-muted px-3 py-2.5">
            Will you attend in person?
          </div>
          <span className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
            <CircleDotIcon aria-hidden="true" className="size-4" />
            Multiple choice
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <span className="flex items-center gap-3">
            <Dot />
            Yes, in person
          </span>
          <span className="flex items-center gap-3">
            <Dot />
            Online, via the stream
          </span>
          <span className="flex items-center gap-3 text-muted-foreground">
            <Dot />
            Add option
          </span>
        </div>
      </div>
      <div className="flex w-full items-center gap-2.5 rounded-lg border bg-card py-3 pr-3 pl-4 shadow-md sm:w-[72%]">
        <LinkIcon aria-hidden="true" className="size-4 flex-none" />
        <span className="min-w-0 flex-1 truncate font-mono text-xs">formly.example/f/k3Jd9aQ2xP7z</span>
        <span className={cn("inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground")}>
          Copy
        </span>
      </div>
      <div className="w-full self-end rounded-lg border bg-card px-4 py-3.5 shadow-md sm:w-[44%]">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">42</span>
          <span className="text-sm text-muted-foreground">responses</span>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full">
          <span className="bg-chart-3" style={{ width: "71%" }} />
          <span className="bg-chart-1" style={{ width: "21%" }} />
          <span className="bg-chart-5" style={{ width: "8%" }} />
        </div>
      </div>
    </div>
  )
}

function UseCases() {
  const [use, setUse] = React.useState<UseCaseKey>("events")
  const u = USE_CASES[use]
  return (
    <section id="uses" className="scroll-mt-16 border-t">
      <div className="mx-auto flex max-w-300 flex-col gap-10 px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <H2>One tool for every time you need answers</H2>
            <p className="mt-3 text-muted-foreground">
              Pick what you&apos;re running. Formly sets the right question types and settings for it.
            </p>
          </div>
          <Tabs value={use} onValueChange={(v) => setUse(v as UseCaseKey)}>
            <TabsList aria-label="Use cases">
              {(Object.keys(USE_CASES) as UseCaseKey[]).map((k) => (
                <TabsTrigger key={k} value={k}>
                  {USE_CASES[k].tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap items-start gap-10" aria-live="polite">
          <div className="flex-[1_1_320px]">
            <h3 className="text-xl font-semibold">{u.title}</h3>
            <p className="mt-2 text-muted-foreground">{u.body}</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {u.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm">
                  <CheckIcon aria-hidden="true" className="mt-0.5 size-4 flex-none" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div data-accent={u.accent} className="flex flex-[1_1_380px] flex-col gap-3 rounded-xl bg-muted p-4 sm:p-6">
            <div className="relative overflow-hidden rounded-lg border bg-card px-5 pt-6 pb-4 before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-form-accent">
              <p className="text-xl font-semibold">{u.formTitle}</p>
              <p className="text-sm text-muted-foreground">{u.formDesc}</p>
            </div>
            <div className="rounded-lg border bg-card px-5 py-5">
              <p className="text-base">
                {u.question} <span className="text-destructive">*</span>
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                {u.options.map((o, i) => (
                  <span key={o} className="flex items-center gap-3">
                    <Dot on={i === u.selected} />
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TryIt() {
  const [question, setQuestion] = React.useState<Question>(() =>
    makeQuestion("MULTIPLE_CHOICE", {
      id: "demo",
      title: "Will you attend in person?",
      required: true,
      options: [
        { id: "d1", label: "Yes, in person" },
        { id: "d2", label: "Online, via the stream" },
        { id: "d3", label: "Not sure yet" },
      ],
    })
  )
  return (
    <section id="try" className="mx-auto max-w-300 scroll-mt-16 px-4 py-22 sm:px-6">
      <div className="max-w-2xl">
        <H2>Try it before you sign up</H2>
        <p className="mt-3 text-muted-foreground">
          This is the real editor card and the real results view. Rename an option, press Enter to add one, change
          the question type, then hover the chart.
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs text-muted-foreground">You build</span>
          <div className="rounded-xl bg-muted p-3 sm:p-4">
            <QuestionCard question={question} onChange={setQuestion} active index={0} accent="violet" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs text-muted-foreground">You read</span>
          <div className="rounded-xl bg-muted p-3 sm:p-4">
            <ResponseSummaryCard title="Will you attend in person?" total={42} kind="pie" data={DEMO_RESULTS} />
          </div>
        </div>
      </div>
    </section>
  )
}

function PhoneSection() {
  return (
    <section className="mx-auto flex max-w-300 flex-wrap-reverse items-center gap-16 px-4 py-22 sm:px-6">
      <div className="flex flex-[1_1_360px] justify-center">
        <div className="h-[640px] w-full max-w-[360px] overflow-hidden rounded-[40px] border-8 border-foreground/90 bg-background shadow-lg">
          <div className="h-full overflow-y-auto">
            <RespondentForm form={SAMPLE_FORM} accent="violet" className="sm:px-3 sm:py-4" />
          </div>
        </div>
      </div>
      <div className="flex-[1_1_360px]">
        <H2>Easy to answer on any phone</H2>
        <p className="mt-3 text-muted-foreground">
          Respondents open the link and start. No app, no account. The phone here is a real form: try submitting it
          empty.
        </p>
        <ul className="mt-6 flex flex-col gap-3.5 text-sm">
          {[
            ["Large, thumb-sized answers.", "16px text and 44px rows, so nothing needs zooming."],
            ["Clear errors.", "A summary at the top and a message under each missing answer."],
            ["Your colour, not ours.", "Each form carries its own accent; pick one of eight."],
          ].map(([a, b]) => (
            <li key={a} className="flex items-start gap-2.5">
              <CheckIcon aria-hidden="true" className="mt-0.5 size-4 flex-none" />
              <span>
                <span className="font-medium">{a}</span> <span className="text-muted-foreground">{b}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** The public marketing page at "/". */
function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <section className="mx-auto flex max-w-300 flex-wrap items-center gap-16 px-4 pt-16 pb-24 sm:px-6 sm:pt-18">
        <div className="flex-[1_1_440px]">
          <h1 className="max-w-140 text-5xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
            Ask the question. Send one link. Read every answer.
          </h1>
          <p className="mt-6 max-w-130 text-lg text-muted-foreground">
            Formly builds registration forms, feedback surveys and quizzes. People answer on any phone without an
            account, and you see results as charts and a table the moment they submit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="xl">
              <Link href="/sign-up">Create a form</Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/f/k3Jd9aQ2xP7z">See an example form</Link>
            </Button>
          </div>
        </div>
        <HeroArt />
      </section>

      <UseCases />

      <section className="border-t bg-muted">
        <div className="mx-auto max-w-300 px-4 py-20 sm:px-6">
          <H2>From blank page to results in three steps</H2>
          <ol className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8">
            {[
              ["Build", "Add questions from eleven types, drag them into order, and mark what's required. Every change saves as you type."],
              ["Share", "Copy one link into a chat, an email or a poster. Respondents fill it in on any device, with clear messages when something is missing."],
              ["Read", "See each question as a chart, step through one person's answers, or export everything to CSV. Close the form when you're done."],
            ].map(([title, body], i) => (
              <li key={title} className="flex flex-col gap-2">
                <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground tabular-nums">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TryIt />

      <section className="border-t">
        <div className="mx-auto max-w-300 px-4 py-20 sm:px-6">
          <H2>A question type for every answer</H2>
          <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {QUESTION_TYPES.map(([Icon, label]) => (
              <li key={label} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
                <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="features" className="scroll-mt-16 border-t bg-muted">
        <div className="mx-auto flex max-w-300 flex-wrap gap-12 px-4 py-20 sm:px-6">
          <div className="flex-[1_1_280px]">
            <H2>Everything a form needs, nothing it doesn&apos;t</H2>
            <p className="mt-3 text-muted-foreground">
              The tools you reach for every week, with sensible defaults so a new form works before you touch a
              setting.
            </p>
          </div>
          <dl className="grid flex-[2_1_520px] grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-10">
            {FEATURES.map(([Icon, title, body]) => (
              <div key={title} className="flex gap-3.5 border-t py-5">
                <span className="grid size-9 flex-none place-items-center rounded-lg border bg-card">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <dt className="text-sm font-medium">{title}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <PhoneSection />

      <section id="faq" className="scroll-mt-16 border-t">
        <div className="mx-auto max-w-200 px-4 py-20 sm:px-6">
          <H2>Questions people ask</H2>
          <Accordion type="single" collapsible defaultValue="faq-0" className="mt-8">
            {FAQS.map(([q, a], i) => (
              <AccordionItem key={q} value={`faq-${i}`}>
                <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-6 rounded-2xl bg-primary px-8 py-12 text-primary-foreground">
          <div>
            <h2 className="text-3xl leading-9 font-semibold tracking-[-0.025em]">Your next form is one click away.</h2>
            <p className="mt-2 opacity-80">Sign up with email or Google. No setup.</p>
          </div>
          <Button asChild size="xl" variant="secondary">
            <Link href="/sign-up">Create a form</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto grid max-w-300 grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo size={24} />
            <p className="mt-3 text-xs text-muted-foreground">Forms, surveys and quizzes with one link.</p>
          </div>
          {[
            ["Product", [["#features", "Features"], ["#uses", "Use cases"], ["/f/k3Jd9aQ2xP7z", "Example form"]]],
            ["Account", [["/sign-up", "Sign up"], ["/sign-in", "Sign in"], ["/forgot-password", "Reset password"]]],
            ["Help", [["#faq", "FAQ"], ["mailto:hello@formly.example", "Contact"]]],
          ].map(([heading, links]) => (
            <nav key={heading as string} aria-label={heading as string} className="flex flex-col gap-2 text-sm">
              <span className="font-medium">{heading as string}</span>
              {(links as string[][]).map(([href, label]) => (
                <Link key={label} href={href} className="text-muted-foreground underline-offset-4 hover:underline">
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="border-t">
          <p className="mx-auto max-w-300 px-4 py-5 text-xs text-muted-foreground sm:px-6">
            Built by Joseph as a Next.js practice project.
          </p>
        </div>
      </footer>
    </div>
  )
}

export { LandingPage }
