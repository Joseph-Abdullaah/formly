import { z } from "zod"

export const QUESTIONS_TYPES = [
  "SHORT_ANSWER",
  "PARAGRAPH",
  "MULTIPLE_CHOICE",
  "CHECKBOXES",
  "DROPDOWN",
  "LINEAR_SCALE",
  "DATE",
  "TIME",
  "MC_GRID",
  "CHECKBOX_GRID",
  "FILE_UPLOAD",
  "TITLE_BLOCK",
  "IMAGE_BLOCK",
] as const

export const createQuestionSchema = z.object({
  sectionId: z.string().min(1),
  type: z.enum(QUESTIONS_TYPES),
  afterQuestionId: z.string().min(1).optional(),
})

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
