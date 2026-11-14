"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { Logo } from "@/components/formly/logo"
import { UserMenu, type FormlyUser, type NavTarget } from "@/components/formly/user-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  user?: FormlyUser
  search?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (q: string) => void
  /** Nodes placed before the avatar (e.g. editor actions). */
  actions?: React.ReactNode
  logoHref?: string
  onNavigate?: (where: NavTarget) => void
  onSignOut?: () => void
  className?: string
}

/** The signed-in header: logo, search, optional actions and the UserMenu. */
function AppHeader({
  user,
  search = true,
  searchPlaceholder = "Search forms",
  searchValue,
  onSearchChange,
  actions,
  logoHref = "/dashboard",
  onNavigate,
  onSignOut,
  className,
}: AppHeaderProps) {
  const [inner, setInner] = React.useState("")
  const q = searchValue ?? inner
  const setQ = (v: string) => {
    if (searchValue === undefined) setInner(v)
    onSearchChange?.(v)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex min-h-header flex-wrap items-center gap-4 border-b bg-background py-2 pr-4 pl-4 sm:pl-6",
        className
      )}
    >
      <Logo href={logoHref} size={28} />
      {search ? (
        <div role="search" className="relative order-last w-full sm:order-none sm:mx-auto sm:max-w-xl sm:flex-1">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search forms"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-muted pl-9 pr-9 shadow-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Clear search"
              onClick={() => setQ("")}
              className="absolute top-1/2 right-0.5 size-7 -translate-y-1/2"
            >
              <XIcon />
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        {actions}
        <UserMenu user={user} onNavigate={onNavigate} onSignOut={onSignOut} />
      </div>
    </header>
  )
}

export { AppHeader }
