import { FormEditorProvider } from "@/components/formly/editor/form-editor"

// Shared header and tabs for Questions, Responses and Settings.
export default async function FormEditorLayout(props: LayoutProps<"/forms/[formId]">) {
  const { formId } = await props.params
  return <FormEditorProvider formId={formId}>{props.children}</FormEditorProvider>
}
