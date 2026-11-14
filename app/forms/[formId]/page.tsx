import { redirect } from "next/navigation"

export default async function FormPage(props: PageProps<"/forms/[formId]">) {
  const { formId } = await props.params
  redirect(`/forms/${formId}/edit`)
}
