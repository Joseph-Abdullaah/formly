import {
  AlignLeftIcon,
  CalendarIcon,
  CircleChevronDownIcon,
  CircleDotIcon,
  ClockIcon,
  SlidersHorizontalIcon,
  SquareCheckIcon,
  TextCursorInputIcon,
  UploadIcon,
  type LucideIcon,
} from "lucide-react"

/**
 * UI-side shapes for the Formly components. They mirror the Prisma models
 * (QuestionType enum, Form.theme.color) so the screens can be wired to the
 * API later without renaming anything.
 */

export const ACCENTS = [
  "violet",
  "blue",
  "sky",
  "emerald",
  "amber",
  "orange",
  "rose",
  "slate",
] as const
export type Accent = (typeof ACCENTS)[number]

export type QuestionType =
  | "SHORT_ANSWER"
  | "PARAGRAPH"
  | "MULTIPLE_CHOICE"
  | "CHECKBOXES"
  | "DROPDOWN"
  | "LINEAR_SCALE"
  | "DATE"
  | "TIME"
  | "FILE_UPLOAD"

export interface QuestionOption {
  id: string
  label: string
}

export interface Question {
  id: string
  type: QuestionType
  title: string
  description: string
  showDescription: boolean
  required: boolean
  options: QuestionOption[]
  hasOther: boolean
  shuffle: boolean
  config: {
    min?: 0 | 1
    max?: number
    minLabel?: string
    maxLabel?: string
  }
  validation: { kind: "length" | "email" | "number"; value?: number } | null
}

export interface FormDraft {
  title: string
  description: string
  questions: Question[]
}

export interface QuestionTypeMeta {
  value: QuestionType
  label: string
  icon: LucideIcon
}

/** The question-type picker, grouped the way the Select shows them. */
export const QUESTION_TYPE_GROUPS: QuestionTypeMeta[][] = [
  [
    { value: "SHORT_ANSWER", label: "Short answer", icon: TextCursorInputIcon },
    { value: "PARAGRAPH", label: "Paragraph", icon: AlignLeftIcon },
  ],
  [
    { value: "MULTIPLE_CHOICE", label: "Multiple choice", icon: CircleDotIcon },
    { value: "CHECKBOXES", label: "Checkboxes", icon: SquareCheckIcon },
    { value: "DROPDOWN", label: "Dropdown", icon: CircleChevronDownIcon },
  ],
  [
    { value: "LINEAR_SCALE", label: "Linear scale", icon: SlidersHorizontalIcon },
    { value: "DATE", label: "Date", icon: CalendarIcon },
    { value: "TIME", label: "Time", icon: ClockIcon },
    { value: "FILE_UPLOAD", label: "File upload", icon: UploadIcon },
  ],
]

export const QUESTION_TYPES = QUESTION_TYPE_GROUPS.flat()

export function questionTypeMeta(type: QuestionType): QuestionTypeMeta {
  return QUESTION_TYPES.find((t) => t.value === type) ?? QUESTION_TYPES[0]
}

const CHOICE_TYPES: QuestionType[] = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"]
export const isChoiceType = (type: QuestionType) => CHOICE_TYPES.includes(type)

export const newId = () => Math.random().toString(36).slice(2, 9)

export function makeQuestion(
  type: QuestionType = "MULTIPLE_CHOICE",
  overrides: Partial<Question> = {}
): Question {
  return {
    id: newId(),
    type,
    title: "",
    description: "",
    showDescription: false,
    required: false,
    options: isChoiceType(type) ? [{ id: newId(), label: "Option 1" }] : [],
    hasOther: false,
    shuffle: false,
    config:
      type === "LINEAR_SCALE" ? { min: 1, max: 5, minLabel: "", maxLabel: "" } : {},
    validation: null,
    ...overrides,
  }
}

/** Switch a question's type, keeping what still applies. */
export function changeQuestionType(q: Question, type: QuestionType): Question {
  const next: Question = { ...q, type }
  if (isChoiceType(type) && !isChoiceType(q.type)) {
    next.options = [{ id: newId(), label: "Option 1" }]
  }
  if (type === "LINEAR_SCALE" && !q.config.max) {
    next.config = { min: 1, max: 5, minLabel: "", maxLabel: "" }
  }
  return next
}

/** Placeholder content for the showcase and screens until the API is wired. */
export const SAMPLE_FORM: FormDraft = {
  title: "Meetup registration",
  description:
    "Monthly meetup for network engineers. 12 November, 17:00, Mogadishu. Takes about two minutes.",
  questions: [
    makeQuestion("SHORT_ANSWER", { id: "q1", title: "Full name", required: true }),
    makeQuestion("MULTIPLE_CHOICE", {
      id: "q2",
      title: "Will you attend in person?",
      required: true,
      options: [
        { id: "o1", label: "Yes, in person" },
        { id: "o2", label: "Online, via the stream" },
        { id: "o3", label: "Not sure yet" },
      ],
    }),
    makeQuestion("CHECKBOXES", {
      id: "q3",
      title: "Which sessions will you join?",
      options: [
        { id: "o4", label: "BGP route filtering workshop" },
        { id: "o5", label: "IPv6 deployment panel" },
        { id: "o6", label: "Lightning talks" },
      ],
    }),
    makeQuestion("LINEAR_SCALE", {
      id: "q4",
      title: "How familiar are you with BGP?",
      required: true,
      config: { min: 1, max: 5, minLabel: "New to it", maxLabel: "Run it daily" },
    }),
    makeQuestion("PARAGRAPH", {
      id: "q5",
      title: "Anything you'd like the organisers to know?",
    }),
  ],
}
