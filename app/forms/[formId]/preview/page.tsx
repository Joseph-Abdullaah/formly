import type { Metadata } from "next"

import { PreviewView } from "@/components/formly/respondent/preview-view"

export const metadata: Metadata = { title: "Preview · Formly" }

export default async function FormPreviewPage(props: PageProps<"/forms/[formId]/preview">) {
  const { formId } = await props.params
  return <PreviewView formId={formId} />
}
