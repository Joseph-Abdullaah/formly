import { z } from "zod"

export const createFormSchema = z.object({
  title: z.string().trim().max(200).optional(),
})

export const listFormsSchema = z.object({
  q: z.string().trim().optional(),
  sort: z.enum(["updated", "opened", "title"]).default("updated"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

const themeSchema = z
  .object({
    color: z.enum([
      "violet",
      "blue",
      "sky",
      "emerald",
      "amber",
      "orange",
      "rose",
      "slate",
    ]),
    font: z.enum(["default", "serif", "mono"]),
    headerImageUrl: z.string().url().nullable(),
  })
  .partial()

const quizSettingsSchema = z
  .object({
    releaseGrade: z.enum(["immediate", "manual"]),
    showMissed: z.boolean(),
    showCorrect: z.boolean(),
    showPoints: z.boolean(),
  })
  .partial()

const settingsSchema = z
  .object({
    acceptingResponses: z.boolean(),
    closedMessage: z.string().max(1000).nullable(),
    collectEmails: z.boolean(),
    limitOneResponse: z.boolean(),
    allowEditAfterSubmit: z.boolean(),
    showProgressBar: z.boolean(),
    shuffleQuestions: z.boolean(),
    requiredByDefault: z.boolean(),
    confirmationMessage: z.string().max(1000),
    showSubmitAnother: z.boolean(),
    isQuiz: z.boolean(),
    quizSettings: quizSettingsSchema,
  })
  .partial()

export const updateFormSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(5000).nullable(),
    theme: themeSchema,
    settings: settingsSchema,
  })
  .partial()
  .strict() // reject unknown keys, e.g. a typo like "colour"
  .refine(
    (data) => Object.keys(data).length > 0,
    "Send at least one field to update"
  )

export type UpdateFormInput = z.infer<typeof updateFormSchema>
