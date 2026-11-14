import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { findMockPublicForm, PublicFormView } from "@/components/formly/respondent/public-form-view"

export async function generateMetadata(props: PageProps<"/f/[publicId]">): Promise<Metadata> {
  const { publicId } = await props.params
  const form = findMockPublicForm(publicId)
  return { title: form ? form.form.title : "Form not found · Formly" }
}

export default async function PublicFormPage(props: PageProps<"/f/[publicId]">) {
  const { publicId } = await props.params
  const form = findMockPublicForm(publicId)
  if (!form) notFound()
  return <PublicFormView publicForm={form} />
}
