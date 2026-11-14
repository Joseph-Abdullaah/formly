import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * The Formly mark: an F drawn as a form (two answer lines and a radio dot),
 * in primary-foreground on a primary tile, so it flips with the theme.
 */
function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const s = size / 64
  const bar = (width: number) => (
    <i
      className="block bg-primary-foreground"
      style={{ width: width * s, height: 8 * s, borderRadius: 4 * s }}
    />
  )
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex flex-none flex-col items-start justify-center bg-primary",
        className
      )}
      style={{ width: size, height: size, borderRadius: 14 * s, paddingLeft: 16 * s, gap: 4 * s }}
    >
      {bar(32)}
      {bar(22)}
      {bar(8)}
    </span>
  )
}

interface LogoProps {
  /** Mark size in px; the word is 0.6× that. Header 28, landing and auth 32. */
  size?: number
  wordmark?: boolean
  href?: string
  className?: string
}

function Logo({ size = 28, wordmark = true, href, className }: LogoProps) {
  const inner = (
    <>
      <LogoMark size={size} />
      {wordmark ? (
        <span style={{ fontSize: Math.round(size * 0.6) }}>Formly</span>
      ) : (
        <span className="sr-only">Formly</span>
      )}
    </>
  )
  const classes = cn(
    "inline-flex items-center gap-2.5 font-semibold tracking-[-0.02em] text-foreground",
    className
  )
  return href ? (
    <Link href={href} className={cn(classes, "rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50")}>
      {inner}
    </Link>
  ) : (
    <span className={classes}>{inner}</span>
  )
}

export { Logo, LogoMark }
