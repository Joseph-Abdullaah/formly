"use client"

import { useFormEditor } from "@/components/formly/editor/form-editor"
import { FormBuilder } from "@/components/formly/form-builder"

/** Editor → Questions tab. */
function QuestionsView() {
  const { draft, accent, setStatus } = useFormEditor()
  // Header (64px) + tab row (~46px) + breathing room.
  return (
    <div className="lg:pr-16">
      <FormBuilder
        form={draft}
        accent={accent}
        defaultActive={draft.questions.length > 1 ? 1 : 0}
        onStatusChange={setStatus}
        stickyTop={128}
      />
    </div>
  )
}

export { QuestionsView }
