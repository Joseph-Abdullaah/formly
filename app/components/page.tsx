import type { Metadata } from "next"

import { Showcase } from "./showcase"

export const metadata: Metadata = {
  title: "Components · Formly",
  description: "Every Formly UI component, live, in light and dark.",
}

export default function ComponentsPage() {
  return <Showcase />
}
