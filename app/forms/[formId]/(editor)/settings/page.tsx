import type { Metadata } from "next"

import { SettingsView } from "@/components/formly/editor/settings-view"

export const metadata: Metadata = { title: "Settings · Formly" }

export default function FormSettingsPage() {
  return <SettingsView />
}
