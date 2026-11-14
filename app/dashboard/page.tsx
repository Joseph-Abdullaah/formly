import type { Metadata } from "next"

import { DashboardView } from "@/components/formly/dashboard/dashboard-view"

export const metadata: Metadata = { title: "My forms · Formly" }

// Mock: ?state=empty shows the first-run dashboard, ?state=loading the skeletons.
export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const { state } = await props.searchParams
  return (
    <DashboardView initialState={state === "empty" || state === "loading" ? state : undefined} />
  )
}
