import type { Metadata } from "next"

import { QuestionsView } from "@/components/formly/editor/questions-view"

export const metadata: Metadata = { title: "Questions · Formly" }

export default function EditFormPage() {
  return <QuestionsView />
}
