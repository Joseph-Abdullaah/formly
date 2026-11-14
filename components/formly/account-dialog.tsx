"use client"

import { toast } from "sonner"

import { ConfirmDialog } from "@/components/formly/confirm-dialog"
import type { FormlyUser } from "@/components/formly/user-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: FormlyUser
}

/** Account settings, opened from the UserMenu. UI only: Save just closes with a toast. */
function AccountDialog({ open, onOpenChange, user }: AccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            onOpenChange(false)
            toast("Account saved")
          }}
        >
          <DialogHeader>
            <DialogTitle>Account settings</DialogTitle>
            <DialogDescription>
              Your name and email show on forms you share with collaborators.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="acct-name">Name</FieldLabel>
              <Input id="acct-name" autoComplete="name" defaultValue={user.name} />
            </Field>
            <Field>
              <FieldLabel htmlFor="acct-email">Email</FieldLabel>
              <Input id="acct-email" type="email" autoComplete="email" defaultValue={user.email} />
              <FieldDescription>Used to sign in.</FieldDescription>
            </Field>
            <div className="flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3">
              <span>
                <span className="block text-sm font-medium">Password</span>
                <span className="text-xs text-muted-foreground">Last changed 3 weeks ago</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toast(`We sent a password reset link to ${user.email}`)}
              >
                Change password
              </Button>
            </div>
          </FieldGroup>
          <DialogFooter className="sm:justify-between">
            <ConfirmDialog
              trigger={
                <Button type="button" variant="ghost" className="text-destructive hover:text-destructive">
                  Delete account
                </Button>
              }
              title="Delete your account?"
              description="This removes your account, every form you own and all their responses. You can't undo this."
              confirmLabel="Delete account"
              onConfirm={() => toast("Deleting an account asks for your password first")}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AccountDialog }
