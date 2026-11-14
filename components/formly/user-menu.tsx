"use client"

import {
  CircleHelpIcon,
  LayoutGridIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserCogIcon,
} from "lucide-react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { AccountDialog } from "@/components/formly/account-dialog"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface FormlyUser {
  name: string
  email: string
  image?: string | null
}

export type NavTarget = "dashboard" | "account" | "help"

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

/** Initials in a secondary circle, or the user's image. */
function UserAvatar({
  user,
  size = 32,
  className,
}: {
  user: FormlyUser
  size?: number
  className?: string
}) {
  return (
    <Avatar className={className} style={{ width: size, height: size }}>
      {user.image ? <AvatarImage src={user.image} alt="" /> : null}
      <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}

/** Mock signed-in user until auth is wired to the UI. */
export const MOCK_USER: FormlyUser = { name: "Joseph Abdullahi", email: "joseph@example.com" }

interface UserMenuProps {
  user?: FormlyUser
  /** Override the default behaviour (dashboard link, account dialog, help toast). */
  onNavigate?: (where: NavTarget) => void
  onSignOut?: () => void
  align?: "start" | "end"
  defaultOpen?: boolean
}

/** The account menu behind the avatar. Appearance applies at once via next-themes. */
function UserMenu({
  user = MOCK_USER,
  onNavigate,
  onSignOut,
  align = "end",
  defaultOpen,
}: UserMenuProps) {
  const { theme = "system", setTheme } = useTheme()
  const router = useRouter()
  const [accountOpen, setAccountOpen] = React.useState(false)

  const navigate = (where: NavTarget) => {
    if (onNavigate) return onNavigate(where)
    if (where === "dashboard") router.push("/dashboard")
    else if (where === "account") setAccountOpen(true)
    else toast("Help and feedback opens in a new tab")
  }
  const signOut = () => {
    if (onSignOut) return onSignOut()
    router.push("/sign-in")
  }

  return (
    <>
    <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} user={user} />
    <DropdownMenu defaultOpen={defaultOpen} modal={false}>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${user.name}`}
        className={cn(
          "group grid place-items-center rounded-full p-1 outline-none",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50"
        )}
      >
        <UserAvatar
          user={user}
          className="transition-shadow group-hover:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--border)] group-data-[state=open]:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--border)]"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-62">
        <DropdownMenuLabel className="flex items-center gap-2.5 font-normal">
          <UserAvatar user={user} size={36} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => navigate("dashboard")}>
            <LayoutGridIcon />
            My forms
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("account")}>
            <UserCogIcon />
            Account settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light" onSelect={(e) => e.preventDefault()}>
            <SunIcon />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" onSelect={(e) => e.preventDefault()}>
            <MoonIcon />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" onSelect={(e) => e.preventDefault()}>
            <MonitorIcon />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => navigate("help")}>
            <CircleHelpIcon />
            Help and feedback
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={signOut}>
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  )
}

export { UserMenu, UserAvatar }
