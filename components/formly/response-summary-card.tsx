"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface SummaryDatum {
  label: string
  count: number
}

export interface ResponseSummaryCardProps {
  title: string
  /** Total responses to the form. */
  total: number
  /** Responses that answered this question (defaults to total). */
  answered?: number
  /** pie: multiple choice / dropdown. bars: checkboxes. scale: linear scale. list: text, date, time. */
  kind?: "pie" | "bars" | "scale" | "list"
  data: SummaryDatum[]
  average?: string | number
  minLabel?: string
  maxLabel?: string
  note?: string
  className?: string
}

// Grey scale only; every mark also carries a text count.
const PIE_COLORS = ["var(--chart-3)", "var(--chart-1)", "var(--chart-5)", "var(--chart-2)", "var(--chart-4)"]

function Pie({
  data,
  hi,
  setHi,
  pct,
}: {
  data: SummaryDatum[]
  hi: number | null
  setHi: (i: number | null) => void
  pct: (n: number) => number
}) {
  const sum = data.reduce((s, d) => s + d.count, 0) || 1
  // Running totals: slice i spans starts[i] .. starts[i] + data[i].count.
  const starts = data.map((_, i) => data.slice(0, i).reduce((s, d) => s + d.count, 0))
  return (
    <svg
      width="168"
      height="168"
      viewBox="0 0 168 168"
      role="img"
      aria-label={data.map((d) => `${d.label} ${d.count}`).join(", ")}
      className="flex-none"
    >
      {data.map((d, i) => {
        const a0 = (starts[i] / sum) * Math.PI * 2
        const a1 = ((starts[i] + d.count) / sum) * Math.PI * 2
        const r = 80
        const x0 = 84 + r * Math.sin(a0)
        const y0 = 84 - r * Math.cos(a0)
        const x1 = 84 + r * Math.sin(a1)
        const y1 = 84 - r * Math.cos(a1)
        const large = a1 - a0 > Math.PI ? 1 : 0
        const path =
          data.length === 1 || d.count === sum
            ? "M84 4a80 80 0 1 1 -0.01 0Z"
            : `M84 84L${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}Z`
        return (
          <path
            key={i}
            d={path}
            fill={PIE_COLORS[i % 5]}
            stroke="var(--card)"
            strokeWidth={2}
            opacity={hi === null || hi === i ? 1 : 0.35}
            onMouseEnter={() => setHi(i)}
            onMouseLeave={() => setHi(null)}
            className="transition-opacity duration-150"
          >
            <title>{`${d.label}: ${d.count} (${pct(d.count)}%)`}</title>
          </path>
        )
      })}
    </svg>
  )
}

/** One question's results on Responses → Summary. */
function ResponseSummaryCard({
  title,
  total,
  answered,
  kind = "bars",
  data,
  average,
  minLabel,
  maxLabel,
  note,
  className,
}: ResponseSummaryCardProps) {
  const [hi, setHi] = React.useState<number | null>(null)
  const [showAll, setShowAll] = React.useState(false)
  const n = answered ?? total
  const max = Math.max(1, ...data.map((d) => d.count))
  const pct = (c: number) => Math.round((c / (total || 1)) * 100)

  let body: React.ReactNode
  if (kind === "pie") {
    body = (
      <div className="mt-5 flex flex-wrap items-center gap-10">
        <Pie data={data} hi={hi} setHi={setHi} pct={pct} />
        <Table className="w-auto min-w-65">
          <TableHeader>
            <TableRow>
              <TableHead>Answer</TableHead>
              <TableHead className="text-right">Count</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d, i) => (
              <TableRow
                key={i}
                data-state={hi === i ? "selected" : undefined}
                onMouseEnter={() => setHi(i)}
                onMouseLeave={() => setHi(null)}
              >
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-xs outline outline-border"
                      style={{ background: PIE_COLORS[i % 5] }}
                    />
                    {d.label}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{d.count}</TableCell>
                <TableCell className="text-right tabular-nums">{pct(d.count)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  } else if (kind === "bars") {
    body = (
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[minmax(120px,max-content)_minmax(0,1fr)_88px]">
        {data.map((d, i) => (
          <React.Fragment key={i}>
            <span onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)}>
              {d.label}
            </span>
            <div
              className="h-6 overflow-hidden rounded-sm bg-muted"
              title={`${d.label}: ${d.count}`}
              onMouseEnter={() => setHi(i)}
              onMouseLeave={() => setHi(null)}
            >
              <div
                className={cn("h-full rounded-sm bg-chart-2 transition-colors", hi === i && "bg-foreground")}
                style={{ width: `${(d.count / (total || max)) * 100}%` }}
              />
            </div>
            <span className="text-right tabular-nums">
              {d.count} <span className="text-muted-foreground">({pct(d.count)}%)</span>
            </span>
          </React.Fragment>
        ))}
      </div>
    )
  } else if (kind === "scale") {
    const cols = { gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }
    body = (
      <>
        <div
          role="img"
          aria-label={data.map((d) => `${d.label}: ${d.count}`).join(", ")}
          className="mt-5 grid h-44 items-end gap-4 border-b pb-2"
          style={cols}
        >
          {data.map((d, i) => (
            <div
              key={i}
              className="flex h-full flex-col items-center justify-end gap-1.5"
              onMouseEnter={() => setHi(i)}
              onMouseLeave={() => setHi(null)}
            >
              <span className={cn("text-xs tabular-nums", hi === i && "font-semibold")}>{d.count}</span>
              <div
                className={cn("w-full rounded-t bg-chart-2 transition-colors", hi === i && "bg-foreground")}
                style={{ height: `${(d.count / max) * 88}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 grid gap-4 text-center text-xs text-muted-foreground" style={cols}>
          {data.map((d, i) => (
            <span key={i}>
              {d.label}
              {i === 0 && minLabel ? ` ${minLabel}` : ""}
              {i === data.length - 1 && maxLabel ? ` ${maxLabel}` : ""}
            </span>
          ))}
        </div>
      </>
    )
  } else {
    const shown = showAll ? data : data.slice(0, 4)
    body = (
      <>
        <ul className="mt-4 flex flex-col gap-2">
          {shown.map((d, i) => (
            <li key={i} className="rounded-md bg-muted px-3 py-2 text-sm">
              {d.label}
              {d.count > 1 ? <span className="text-muted-foreground"> ({d.count})</span> : null}
            </li>
          ))}
        </ul>
        {data.length > 4 ? (
          <Button variant="link" size="sm" className="mt-2 px-0" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show less" : `Show all ${data.length}`}
          </Button>
        ) : null}
      </>
    )
  }

  return (
    <section className={cn("rounded-lg border bg-card p-6 text-card-foreground shadow-sm", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">
        {n} {n === 1 ? "response" : "responses"}
        {note ? ` · ${note}` : ""}
        {average !== undefined ? ` · Average ${average}` : ""}
      </p>
      {body}
    </section>
  )
}

export { ResponseSummaryCard }
