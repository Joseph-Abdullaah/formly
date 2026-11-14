"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"

import { FloatingToolbar } from "@/components/formly/floating-toolbar"
import { FormHeaderCard } from "@/components/formly/form-header-card"
import {
  makeQuestion,
  newId,
  type Accent,
  type FormDraft,
  type Question,
} from "@/components/formly/form-data"
import { QuestionCard } from "@/components/formly/question-card"
import type { SaveState } from "@/components/formly/save-status"
import { cn } from "@/lib/utils"

function SortableQuestion({
  question,
  index,
  active,
  accent,
  onActivate,
  onChange,
  onDuplicate,
  onDelete,
  onMove,
  titleRef,
}: {
  question: Question
  index: number
  active: boolean
  accent?: Accent
  onActivate: () => void
  onChange: (q: Question) => void
  onDuplicate: () => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
  titleRef?: React.Ref<HTMLInputElement>
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id })

  const handleProps: React.HTMLAttributes<HTMLButtonElement> = {
    ...attributes,
    ...listeners,
    // Grip + Up / Down moves the card one step without entering drag mode.
    onKeyDown: (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault()
        onMove(e.key === "ArrowUp" ? -1 : 1)
        return
      }
      listeners?.onKeyDown?.(e)
    },
  }

  return (
    <QuestionCard
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      question={question}
      index={index}
      active={active}
      accent={accent}
      onActivate={onActivate}
      onChange={onChange}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      dragHandleProps={handleProps}
      dragHandleRef={setActivatorNodeRef}
      isDragging={isDragging}
      titleRef={titleRef}
    />
  )
}

export interface FormBuilderProps {
  form: FormDraft
  accent?: Accent
  defaultActive?: number
  onChange?: (form: FormDraft) => void
  onStatusChange?: (status: SaveState) => void
  showToolbar?: boolean
  /** px from the viewport top where the desktop toolbar sticks (below your header). */
  stickyTop?: number
  className?: string
}

/**
 * The Questions tab: editable header card, the question list with one active
 * card, drag-to-reorder, the floating toolbar, autosave status and Undo.
 * State is local; onChange reports the whole draft for the caller to persist.
 */
function FormBuilder({
  form,
  accent = "violet",
  defaultActive = 0,
  onChange,
  onStatusChange,
  showToolbar = true,
  stickyTop = 80,
  className,
}: FormBuilderProps) {
  const [title, setTitle] = React.useState(form.title)
  const [description, setDescription] = React.useState(form.description)
  const [questions, setQuestions] = React.useState(form.questions)
  const [activeId, setActiveId] = React.useState<string | null>(
    form.questions[defaultActive]?.id ?? null
  )
  const [dragId, setDragId] = React.useState<string | null>(null)
  const focusTitleOf = React.useRef<string | null>(null)
  const titleInput = React.useRef<HTMLInputElement>(null)
  // Stable id so dnd-kit's aria-describedby matches between server and client.
  const dndId = React.useId()

  // Autosave signal: "saving" on every change, "saved" 800ms after the last.
  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    onStatusChange?.("saving")
    onChange?.({ title, description, questions })
    const t = setTimeout(() => onStatusChange?.("saved"), 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, questions])

  React.useEffect(() => {
    if (focusTitleOf.current && focusTitleOf.current === activeId) {
      titleInput.current?.focus({ preventScroll: true })
      focusTitleOf.current = null
    }
  }, [activeId, questions])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeIndex = questions.findIndex((q) => q.id === activeId)

  const insertAt = (index: number, q: Question) => {
    setQuestions((list) => {
      const next = list.slice()
      next.splice(index, 0, q)
      return next
    })
    focusTitleOf.current = q.id
    setActiveId(q.id)
  }

  const addQuestion = () => insertAt(activeIndex + 1, makeQuestion("MULTIPLE_CHOICE"))

  const duplicate = (q: Question) =>
    insertAt(questions.findIndex((x) => x.id === q.id) + 1, {
      ...q,
      id: newId(),
      options: q.options.map((o) => ({ ...o, id: newId() })),
    })

  const remove = (q: Question) => {
    const index = questions.findIndex((x) => x.id === q.id)
    setQuestions((list) => list.filter((x) => x.id !== q.id))
    setActiveId(questions[index + 1]?.id ?? questions[index - 1]?.id ?? null)
    toast("Question deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          setQuestions((list) => {
            const next = list.slice()
            next.splice(index, 0, q)
            return next
          })
          setActiveId(q.id)
        },
      },
    })
  }

  const move = (id: string, dir: -1 | 1) =>
    setQuestions((list) => {
      const from = list.findIndex((x) => x.id === id)
      const to = from + dir
      if (to < 0 || to >= list.length) return list
      return arrayMove(list, from, to)
    })

  const onDragStart = ({ active }: DragStartEvent) => setDragId(String(active.id))
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragId(null)
    if (!over || active.id === over.id) return
    setQuestions((list) =>
      arrayMove(
        list,
        list.findIndex((x) => x.id === active.id),
        list.findIndex((x) => x.id === over.id)
      )
    )
  }

  const dragged = questions.find((q) => q.id === dragId)

  return (
    <div data-accent={accent} className={cn("relative mx-auto w-full max-w-editor", className)}>
      <div className="flex flex-col gap-3">
        <FormHeaderCard
          title={title}
          description={description}
          accent={accent}
          onChange={(patch) => {
            if (patch.title !== undefined) setTitle(patch.title)
            if (patch.description !== undefined) setDescription(patch.description)
          }}
        />

        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setDragId(null)}
        >
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            {questions.map((q, i) => (
              <SortableQuestion
                key={q.id}
                question={q}
                index={i}
                active={q.id === activeId}
                accent={accent}
                onActivate={() => setActiveId(q.id)}
                onChange={(next) =>
                  setQuestions((list) => list.map((x) => (x.id === q.id ? next : x)))
                }
                onDuplicate={() => duplicate(q)}
                onDelete={() => remove(q)}
                onMove={(dir) => move(q.id, dir)}
                titleRef={q.id === activeId ? titleInput : undefined}
              />
            ))}
          </SortableContext>
          <DragOverlay dropAnimation={{ duration: 250 }}>
            {dragged ? (
              <QuestionCard question={dragged} onChange={() => {}} accent={accent} className="shadow-md" />
            ) : null}
          </DragOverlay>
        </DndContext>

        {questions.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-card px-6 py-8 text-center text-sm text-muted-foreground">
            No questions yet. Use Add question to start.
          </p>
        ) : null}
      </div>

      {showToolbar ? (
        <>
          {/* Desktop: sticks beside the cards. Phone: fixed to the bottom. */}
          <div className="absolute top-0 -right-16 hidden h-full lg:block">
            <FloatingToolbar className="sticky" style={{ top: stickyTop }} onAddQuestion={addQuestion} />
          </div>
          <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center lg:hidden">
            <FloatingToolbar orientation="horizontal" onAddQuestion={addQuestion} />
          </div>
        </>
      ) : null}
    </div>
  )
}

export { FormBuilder }
