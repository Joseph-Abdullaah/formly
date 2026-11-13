import { z } from "zod"

export const QUESTION_TYPES = [
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
  type: z.enum(QUESTION_TYPES),
  afterQuestionId: z.string().min(1).optional(),
})

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>

export const updateQuestionSchema = z
  .object({
    title: z.string().max(1000),
    description: z.string().max(5000).nullable(),
    type: z.enum(QUESTION_TYPES),
    required: z.boolean(),
    config: z.record(z.string(), z.unknown()),
    imageUrl: z.string().url().nullable(),
    points: z.number().int().min(0).max(1000),
    feedback: z
      .object({
        correct: z.string().max(1000).optional(),
        incorrect: z.string().max(1000).optional(),
      })
      .nullable(),
  })
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Send at least one field to update"
  )

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>

export const reorderQuestionsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sectionId: z.string().min(1),
        position: z.number().int().min(0),
      })
    )
    .min(1)
    .max(500)
    .refine(
      (items) => new Set(items.map((i) => i.id)).size === items.length,
      "Each question can appear only once"
    ),
})

export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>

const optionSchema = z.object({
  id: z.string().min(1).optional(), // no id = new option
  kind: z.enum(["CHOICE", "ROW", "COLUMN"]),
  label: z.string().max(500),
  isOther: z.boolean().default(false),
  isCorrect: z.boolean().default(false),
  imageUrl: z.string().url().nullable().default(null),
  navAction: z.enum(["NEXT", "GO_TO_SECTION", "SUBMIT"]).default("NEXT"),
  targetSectionId: z.string().min(1).nullable().default(null),
})

export const saveOptionsSchema = z.object({
  options: z
    .array(optionSchema)
    .max(200)
    .refine((options) => {
      const ids = options.filter((o) => o.id).map((o) => o.id)
      return new Set(ids).size === ids.length
    }, "Each option id can appear only once"),
})

export type SaveOptionsInput = z.infer<typeof saveOptionsSchema>
