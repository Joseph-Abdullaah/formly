"use client"

import * as React from "react"
import { CheckIcon, CodeIcon, CopyIcon, LinkIcon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { UserAvatar, type FormlyUser } from "@/components/formly/user-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface Collaborator {
  name: string
  email: string
}

export interface ShareDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactElement
  /** Full public URL, e.g. https://formly.app/f/k3Jd9aQ2xP7z */
  link: string
  owner: FormlyUser
  collaborators?: Collaborator[]
  onInvite?: (email: string) => void
  onRemove?: (email: string) => void
  defaultTab?: "link" | "embed" | "people"
}

function useCopied() {
  const [copied, setCopied] = React.useState(false)
  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard can be blocked; the field is still selectable.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(message)
  }
  return [copied, copy] as const
}

/** The Send dialog: Link, Embed and Collaborators tabs. */
function ShareDialog({
  open,
  onOpenChange,
  trigger,
  link,
  owner,
  collaborators: initialPeople = [],
  onInvite,
  onRemove,
  defaultTab = "link",
}: ShareDialogProps) {
  const [linkCopied, copyLink] = useCopied()
  const [embedCopied, copyEmbed] = useCopied()
  const [width, setWidth] = React.useState("640")
  const [height, setHeight] = React.useState("800")
  const [people, setPeople] = React.useState(initialPeople)
  const [invite, setInvite] = React.useState("")
  const [inviteError, setInviteError] = React.useState("")

  const embed = `<iframe src="${link}?embed=1" width="${width}" height="${height}" frameborder="0">Loading…</iframe>`

  const addPerson = () => {
    const email = invite.trim()
    if (!EMAIL_RE.test(email)) return setInviteError("Enter an email address like name@example.com")
    if (email === owner.email || people.some((p) => p.email === email))
      return setInviteError("That person already has access")
    setPeople([...people, { name: email.split("@")[0], email }])
    setInvite("")
    setInviteError("")
    onInvite?.(email)
    toast.success(`Invited ${email}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-135">
        <DialogHeader>
          <DialogTitle>Send form</DialogTitle>
          <DialogDescription>
            Anyone with the link can respond while the form is accepting responses.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="min-w-0 gap-5">
          <TabsList aria-label="Ways to send">
            <TabsTrigger value="link">
              <LinkIcon />
              Link
            </TabsTrigger>
            <TabsTrigger value="embed">
              <CodeIcon />
              Embed
            </TabsTrigger>
            <TabsTrigger value="people">
              <UsersIcon />
              Collaborators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link">
            <Field>
              <FieldLabel htmlFor="share-link">Form link</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="share-link"
                  readOnly
                  value={link}
                  onFocus={(e) => e.target.select()}
                  className="bg-muted font-mono text-[13px] md:text-[13px]"
                />
                <Button className="flex-none" onClick={() => copyLink(link, "Link copied")}>
                  {linkCopied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
                  {linkCopied ? "Copied" : "Copy link"}
                </Button>
              </div>
            </Field>
          </TabsContent>

          <TabsContent value="embed">
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="embed-w">Width (px)</FieldLabel>
                  <Input id="embed-w" type="number" min={200} value={width} onChange={(e) => setWidth(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="embed-h">Height (px)</FieldLabel>
                  <Input id="embed-h" type="number" min={200} value={height} onChange={(e) => setHeight(e.target.value)} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="embed-code">Embed code</FieldLabel>
                <Textarea id="embed-code" readOnly rows={3} value={embed} className="font-mono text-xs md:text-xs" />
              </Field>
              <Button variant="outline" className="self-start" onClick={() => copyEmbed(embed, "Embed code copied")}>
                {embedCopied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
                {embedCopied ? "Copied" : "Copy code"}
              </Button>
            </FieldGroup>
          </TabsContent>

          <TabsContent value="people" className="flex flex-col gap-4">
            <form
              noValidate
              className="flex items-start gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                addPerson()
              }}
            >
              <Field data-invalid={!!inviteError || undefined} className="flex-1">
                <FieldLabel htmlFor="invite-email">Add an editor</FieldLabel>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@example.com"
                  value={invite}
                  aria-invalid={!!inviteError}
                  onChange={(e) => {
                    setInvite(e.target.value)
                    setInviteError("")
                  }}
                />
                {inviteError ? <FieldError>{inviteError}</FieldError> : null}
              </Field>
              <Button type="submit" className="mt-[22px] flex-none">
                Invite
              </Button>
            </form>
            <ul className="flex flex-col divide-y rounded-lg border">
              <li className="flex items-center gap-3 px-3 py-2.5">
                <UserAvatar user={owner} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{owner.name} (you)</span>
                  <span className="block truncate text-xs text-muted-foreground">{owner.email}</span>
                </span>
                <span className="text-xs text-muted-foreground">Owner</span>
              </li>
              {people.map((p) => (
                <li key={p.email} className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar user={p} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{p.email}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPeople(people.filter((x) => x.email !== p.email))
                      onRemove?.(p.email)
                      toast(`Removed ${p.email}`)
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ShareDialog }
