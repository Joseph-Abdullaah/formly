"use client"

import { CirclePlusIcon, FileInputIcon, ImageIcon, Rows3Icon, TypeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface FloatingToolbarProps {
  onAddQuestion?: () => void
  onImport?: () => void
  onAddTitle?: () => void
  onAddImage?: () => void
  onAddSection?: () => void
  /** vertical: desktop, beside the active card. horizontal: phone, fixed to the bottom. */
  orientation?: "vertical" | "horizontal"
  className?: string
  style?: React.CSSProperties
}

/** The editor's add toolbar. */
function FloatingToolbar({
  onAddQuestion,
  onImport,
  onAddTitle,
  onAddImage,
  onAddSection,
  orientation = "vertical",
  className,
  style,
}: FloatingToolbarProps) {
  const items = [
    { label: "Add question", icon: CirclePlusIcon, onClick: onAddQuestion },
    { label: "Import questions", icon: FileInputIcon, onClick: onImport },
    { label: "Add title and description", icon: TypeIcon, onClick: onAddTitle },
    { label: "Add image", icon: ImageIcon, onClick: onAddImage },
    { label: "Add section", icon: Rows3Icon, onClick: onAddSection },
  ]
  return (
    <div
      role="toolbar"
      aria-label="Add to form"
      aria-orientation={orientation}
      style={style}
      className={cn(
        "inline-flex gap-0.5 rounded-lg border bg-card p-1 shadow-md",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className
      )}
    >
      {items.map(({ label, icon: Icon, onClick }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={label}
              onClick={onClick}
              className="size-10 [&_svg:not([class*='size-'])]:size-5"
            >
              <Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={orientation === "vertical" ? "left" : "top"}>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

export { FloatingToolbar }
