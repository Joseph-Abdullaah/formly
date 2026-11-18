import { Prisma } from "@/generated/prisma/client"

export function mergeJson(
  oldValue: Prisma.JsonValue | null | undefined,
  changes: object
) {
  const base =
    oldValue && typeof oldValue === "object" && !Array.isArray(oldValue)
      ? oldValue
      : {}

  return { ...base, ...changes } as Prisma.InputJsonObject
}
