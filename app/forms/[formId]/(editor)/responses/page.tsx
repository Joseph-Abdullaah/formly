import type { Metadata } from "next"

import { ResponsesView } from "@/components/formly/editor/responses-view"

export const metadata: Metadata = { title: "Responses · Formly" }

export default function FormResponsesPage() {
  return <ResponsesView />
}
