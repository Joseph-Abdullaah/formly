"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  CalendarIcon,
  ClockIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  GripHorizontalIcon,
  GripVerticalIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"

import {
  changeQuestionType,
  isChoiceType,
  newId,
  QUESTION_TYPE_GROUPS,
  questionTypeMeta,
  type Accent,
  type Question,
  type QuestionOption,
  type QuestionType,
} from "@/components/formly/form-data"
import { AutoGrowTextarea, InlineInput } from "@/components/formly/inline-edit"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function IconButton({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** The marker in front of an option: radio, checkbox or number. */
function OptionMarker({ type, index }: { type: QuestionType; index: number }) {
  if (type === "DROPDOWN") {
    return <span className="w-5 text-right text-sm text-muted-foreground tabular-nums">{index + 1}.</span>
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-4 flex-none border-2 border-input",
        type === "MULTIPLE_CHOICE" ? "rounded-full" : "rounded-[4px]"
      )}
    />
  )
}

function QuestionTypeSelect({
  value,
  onValueChange,
}: {
  value: QuestionType
  onValueChange: (t: QuestionType) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as QuestionType)}>
      <SelectTrigger aria-label="Question type" className="w-full sm:w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {QUESTION_TYPE_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 ? <SelectSeparator /> : null}
            <SelectGroup>
              {group.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <t.icon />
                  {t.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  )
}

/* ------------------------------------------------------------------ */
/* Options editor (choice types)                                       */
/* ------------------------------------------------------------------ */

function SortableOption({
  option,
  index,
  type,
  canRemove,
  onLabel,
  onEnter,
  onRemove,
  onMove,
  inputRef,
}: {
  option: QuestionOption
  index: number
  type: QuestionType
  canRemove: boolean
  onLabel: (label: string) => void
  onEnter: () => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  inputRef: (el: HTMLInputElement | null) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: option.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group/option -ml-6 flex items-center gap-2 rounded-md bg-card",
        isDragging && "relative z-10 shadow-md"
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={`Reorder option ${index + 1}`}
        className="grid h-9 w-4 cursor-grab place-items-center rounded-sm text-muted-foreground opacity-0 outline-none group-hover/option:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon aria-hidden="true" className="size-4" />
      </button>
      <OptionMarker type={type} index={index} />
      <InlineInput
        ref={inputRef}
        aria-label={`Option ${index + 1}`}
        value={option.label}
        onChange={(e) => onLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onEnter()
          } else if (e.key === "Backspace" && option.label === "" && canRemove) {
            e.preventDefault()
            onRemove()
          } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            e.preventDefault()
            onMove(e.key === "ArrowUp" ? -1 : 1)
          }
        }}
        className="text-sm"
      />
      {canRemove ? (
        <IconButton label="Remove option" onClick={onRemove} className="text-muted-foreground">
          <XIcon />
        </IconButton>
      ) : (
        <span className="size-9 flex-none" />
      )}
    </li>
  )
}

function OptionsEditor({
  question,
  onChange,
}: {
  question: Question
  onChange: (q: Question) => void
}) {
  const inputs = React.useRef(new Map<string, HTMLInputElement>())
  const focusNext = React.useRef<string | null>(null)
  // Stable id so dnd-kit's aria-describedby matches between server and client.
  const dndId = React.useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  React.useEffect(() => {
    if (focusNext.current) {
      inputs.current.get(focusNext.current)?.focus()
      focusNext.current = null
    }
  })

  const setOptions = (options: QuestionOption[]) => onChange({ ...question, options })
  const opts = question.options

  const addAfter = (index: number) => {
    const opt = { id: newId(), label: `Option ${opts.length + 1}` }
    const next = opts.slice()
    next.splice(index + 1, 0, opt)
    focusNext.current = opt.id
    setOptions(next)
  }
  const remove = (index: number) => {
    const next = opts.filter((_, i) => i !== index)
    focusNext.current = next[Math.max(0, index - 1)]?.id ?? null
    setOptions(next)
  }
  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir
    if (to < 0 || to >= opts.length) return
    focusNext.current = opts[index].id
    setOptions(arrayMove(opts, index, to))
  }
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = opts.findIndex((o) => o.id === active.id)
    const to = opts.findIndex((o) => o.id === over.id)
    setOptions(arrayMove(opts, from, to))
  }

  return (
    <div className="flex flex-col gap-2 pl-6">
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={opts.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {opts.map((opt, i) => (
              <SortableOption
                key={opt.id}
                option={opt}
                index={i}
                type={question.type}
                canRemove={opts.length > 1}
                onLabel={(label) =>
                  setOptions(opts.map((o) => (o.id === opt.id ? { ...o, label } : o)))
                }
                onEnter={() => addAfter(i)}
                onRemove={() => remove(i)}
                onMove={(dir) => move(i, dir)}
                inputRef={(el) => {
                  if (el) inputs.current.set(opt.id, el)
                  else inputs.current.delete(opt.id)
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {question.hasOther && question.type !== "DROPDOWN" ? (
        <div className="flex items-center gap-2">
          <OptionMarker type={question.type} index={opts.length} />
          <span className="flex-1 border-b border-dotted py-1 text-sm text-muted-foreground">
            Other…
          </span>
          <IconButton
            label="Remove “Other”"
            onClick={() => onChange({ ...question, hasOther: false })}
            className="text-muted-foreground"
          >
            <XIcon />
          </IconButton>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <OptionMarker type={question.type} index={opts.length + (question.hasOther ? 1 : 0)} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-1 px-1 text-muted-foreground"
          onClick={() => addAfter(opts.length - 1)}
        >
          Add option
        </Button>
        {!question.hasOther && question.type !== "DROPDOWN" ? (
          <>
            <span className="text-muted-foreground">or</span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-1"
              onClick={() => onChange({ ...question, hasOther: true })}
            >
              add “Other”
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Type-specific bodies                                                */
/* ------------------------------------------------------------------ */

function AnswerPlaceholder({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        "border-b border-dotted py-2 text-sm text-muted-foreground",
        wide ? "w-full" : "w-full sm:w-1/2"
      )}
    >
      {children}
    </div>
  )
}

function LinearScaleEditor({
  question,
  onChange,
}: {
  question: Question
  onChange: (q: Question) => void
}) {
  const { min = 1, max = 5, minLabel = "", maxLabel = "" } = question.config
  const setConfig = (patch: Partial<Question["config"]>) =>
    onChange({ ...question, config: { ...question.config, ...patch } })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm">
        <Select value={String(min)} onValueChange={(v) => setConfig({ min: Number(v) as 0 | 1 })}>
          <SelectTrigger aria-label="Scale starts at" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0</SelectItem>
            <SelectItem value="1">1</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">to</span>
        <Select value={String(max)} onValueChange={(v) => setConfig({ max: Number(v) })}>
          <SelectTrigger aria-label="Scale ends at" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 text-sm sm:w-2/3">
        {(
          [
            ["minLabel", min, minLabel],
            ["maxLabel", max, maxLabel],
          ] as const
        ).map(([key, n, val]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-5 text-muted-foreground tabular-nums">{n}</span>
            <InlineInput
              aria-label={`Label for ${n} (optional)`}
              placeholder="Label (optional)"
              value={val}
              onChange={(e) => setConfig({ [key]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestionBody({ question, onChange }: { question: Question; onChange: (q: Question) => void }) {
  switch (question.type) {
    case "SHORT_ANSWER":
      return <AnswerPlaceholder>Short answer text</AnswerPlaceholder>
    case "PARAGRAPH":
      return <AnswerPlaceholder wide>Long answer text</AnswerPlaceholder>
    case "MULTIPLE_CHOICE":
    case "CHECKBOXES":
    case "DROPDOWN":
      return <OptionsEditor question={question} onChange={onChange} />
    case "LINEAR_SCALE":
      return <LinearScaleEditor question={question} onChange={onChange} />
    case "DATE":
      return (
        <AnswerPlaceholder>
          <span className="flex items-center justify-between">
            Day, month, year <CalendarIcon aria-hidden="true" className="size-4" />
          </span>
        </AnswerPlaceholder>
      )
    case "TIME":
      return (
        <AnswerPlaceholder>
          <span className="flex items-center justify-between">
            Time <ClockIcon aria-hidden="true" className="size-4" />
          </span>
        </AnswerPlaceholder>
      )
    case "FILE_UPLOAD":
      return (
        <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
          <UploadIcon aria-hidden="true" className="size-4" />
          Respondents upload one file, up to 10 MB.
        </div>
      )
  }
}

/** Read-only preview shown on inactive cards. */
function QuestionPreview({ question }: { question: Question }) {
  const meta = questionTypeMeta(question.type)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-base">
        {question.title || <span className="text-muted-foreground">Untitled question</span>}
        {question.required ? (
          <span className="text-destructive" aria-label="required">
            {" "}
            *
          </span>
        ) : null}
      </p>
      {question.showDescription && question.description ? (
        <p className="text-sm text-muted-foreground">{question.description}</p>
      ) : null}
      {isChoiceType(question.type) ? (
        <ul className="flex flex-col gap-2">
          {question.options.map((o, i) => (
            <li key={o.id} className="flex items-center gap-3 text-sm">
              <OptionMarker type={question.type} index={i} />
              {o.label}
            </li>
          ))}
          {question.hasOther && question.type !== "DROPDOWN" ? (
            <li className="flex items-center gap-3 text-sm">
              <OptionMarker type={question.type} index={question.options.length} />
              Other…
            </li>
          ) : null}
        </ul>
      ) : question.type === "LINEAR_SCALE" ? (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{question.config.minLabel}</span>
          <div className="flex gap-3">
            {Array.from(
              { length: (question.config.max ?? 5) - (question.config.min ?? 1) + 1 },
              (_, i) => (
                <span key={i} className="flex flex-col items-center gap-1 text-xs">
                  {(question.config.min ?? 1) + i}
                  <span className="size-4 rounded-full border-2 border-input" />
                </span>
              )
            )}
          </div>
          <span>{question.config.maxLabel}</span>
        </div>
      ) : (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <meta.icon aria-hidden="true" className="size-4" />
          {meta.label}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* QuestionCard                                                        */
/* ------------------------------------------------------------------ */

export interface QuestionCardProps {
  question: Question
  onChange: (q: Question) => void
  active?: boolean
  onActivate?: () => void
  onDuplicate?: (q: Question) => void
  onDelete?: (q: Question) => void
  /** Spread onto the card's grip (dnd-kit listeners + attributes). */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  dragHandleRef?: (el: HTMLElement | null) => void
  isDragging?: boolean
  isOver?: boolean
  accent?: Accent
  index?: number
  className?: string
  style?: React.CSSProperties
  ref?: React.Ref<HTMLDivElement>
  titleRef?: React.Ref<HTMLInputElement>
}

function QuestionCard({
  question,
  onChange,
  active = false,
  onActivate,
  onDuplicate,
  onDelete,
  dragHandleProps,
  dragHandleRef,
  isDragging,
  isOver,
  accent,
  index,
  className,
  style,
  ref,
  titleRef,
}: QuestionCardProps) {
  const id = React.useId()
  const q = question

  return (
    <div
      ref={ref}
      style={style}
      data-accent={accent}
      tabIndex={active ? -1 : 0}
      role={active ? "group" : "button"}
      aria-label={
        active
          ? `Question ${index !== undefined ? index + 1 : ""}`.trim()
          : `Edit question${index !== undefined ? ` ${index + 1}` : ""}: ${q.title || "Untitled question"}`
      }
      onClick={active ? undefined : onActivate}
      onKeyDown={(e) => {
        if (!active && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
          e.preventDefault()
          onActivate?.()
        }
      }}
      className={cn(
        "group/card relative rounded-lg border bg-card px-6 pt-2 pb-5 text-card-foreground shadow-sm outline-none transition-[box-shadow,border-color] duration-200 ease-out",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        !active && "cursor-pointer hover:border-ring/60",
        active &&
          "shadow-md before:absolute before:-inset-y-px before:-left-px before:w-1.5 before:rounded-l-lg before:bg-form-accent",
        isDragging && "opacity-50",
        isOver && "outline-2 outline-offset-4 outline-ring outline-dashed",
        className
      )}
    >
      {/* Grip: drag, or focus it and press Up / Down. */}
      <div className="flex justify-center">
        <button
          type="button"
          ref={dragHandleRef}
          aria-label="Reorder question"
          onClick={(e) => e.stopPropagation()}
          className="grid h-5 w-10 cursor-grab place-items-center rounded-sm text-muted-foreground opacity-0 outline-none group-hover/card:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing data-[active=true]:opacity-100"
          data-active={active}
          {...dragHandleProps}
        >
          <GripHorizontalIcon aria-hidden="true" className="size-4" />
        </button>
      </div>

      {!active ? (
        <QuestionPreview question={q} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-1 flex-col gap-1">
              <InlineInput
                ref={titleRef}
                aria-label="Question"
                placeholder="Question"
                value={q.title}
                onChange={(e) => onChange({ ...q, title: e.target.value })}
                className="rounded-t-md bg-muted px-3 py-3 text-base hover:border-input"
              />
              {q.showDescription ? (
                <AutoGrowTextarea
                  aria-label="Description"
                  placeholder="Description"
                  value={q.description}
                  onChange={(e) => onChange({ ...q, description: e.target.value })}
                  className="px-3 text-sm text-muted-foreground"
                />
              ) : null}
            </div>
            <QuestionTypeSelect
              value={q.type}
              onValueChange={(t) => onChange(changeQuestionType(q, t))}
            />
          </div>

          <QuestionBody question={q} onChange={onChange} />

          <div className="mt-1 flex flex-wrap items-center justify-end gap-1 border-t pt-3">
            <IconButton label="Duplicate" onClick={() => onDuplicate?.(q)}>
              <CopyIcon />
            </IconButton>
            <IconButton label="Delete" onClick={() => onDelete?.(q)}>
              <Trash2Icon />
            </IconButton>
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-6" />
            <div className="flex items-center gap-2 pr-1">
              <Label htmlFor={`${id}-required`} className="font-normal">
                Required
              </Label>
              <Switch
                id={`${id}-required`}
                checked={q.required}
                onCheckedChange={(required) => onChange({ ...q, required })}
              />
            </div>
            <DropdownMenu modal={false}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" aria-label="More options">
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Show
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuCheckboxItem
                    checked={q.showDescription}
                    onCheckedChange={(v) => onChange({ ...q, showDescription: v })}
                  >
                    Description
                  </DropdownMenuCheckboxItem>
                  {q.type === "SHORT_ANSWER" || q.type === "PARAGRAPH" ? (
                    <DropdownMenuCheckboxItem
                      checked={!!q.validation}
                      onCheckedChange={(v) =>
                        onChange({ ...q, validation: v ? { kind: "length", value: 100 } : null })
                      }
                    >
                      Response validation
                    </DropdownMenuCheckboxItem>
                  ) : null}
                  {isChoiceType(q.type) ? (
                    <DropdownMenuCheckboxItem
                      checked={q.shuffle}
                      onCheckedChange={(v) => onChange({ ...q, shuffle: v })}
                    >
                      Shuffle option order
                    </DropdownMenuCheckboxItem>
                  ) : null}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  )
}

export { QuestionCard, QuestionTypeSelect }
