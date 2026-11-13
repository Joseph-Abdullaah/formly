import type { QuestionType, OptionKind } from "@/generated/prisma/client"

type DefaultOption = { kind: OptionKind; label: string; position: number }

type QuestionDefaults = {
  title: string
  config: object
  options: DefaultOption[]
}

export function getQuestionDefaults(type: QuestionType): QuestionDefaults {
  switch (type) {
    // Choice types start with one option
    case "MULTIPLE_CHOICE":
    case "CHECKBOXES":
    case "DROPDOWN":
      return {
        title: "Untitled question",
        config: {},
        options: [{ kind: "CHOICE", label: "Option 1", position: 0 }],
      }

    // Grids start with one row and one column
    case "MC_GRID":
    case "CHECKBOX_GRID":
      return {
        title: "Untitled question",
        config: {},
        options: [
          { kind: "ROW", label: "Row 1", position: 0 },
          { kind: "COLUMN", label: "Column 1", position: 0 },
        ],
      }

    case "LINEAR_SCALE":
      return {
        title: "Untitled question",
        config: { min: 1, max: 5 },
        options: [],
      }

    case "DATE":
      return {
        title: "Untitled question",
        config: { includeYear: true, includeTime: false },
        options: [],
      }

    case "TIME":
      return {
        title: "Untitled question",
        config: { duration: false },
        options: [],
      }

    case "FILE_UPLOAD":
      return {
        title: "Untitled question",
        config: { allowedTypes: [], maxFiles: 1, maxSizeMb: 10 },
        options: [],
      }

    case "TITLE_BLOCK":
      return { title: "Untitled title", config: {}, options: [] }

    case "IMAGE_BLOCK":
      return { title: "", config: {}, options: [] }

    // SHORT_ANSWER, PARAGRAPH
    default:
      return { title: "Untitled question", config: {}, options: [] }
  }
}
