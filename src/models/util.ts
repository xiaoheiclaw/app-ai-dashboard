// "YYYY-MM" (or "YYYY-MM-DD") → fractional month index since year 0, for x-axis.
export function monthIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number)
  return y * 12 + (m - 1) + (d ? (d - 1) / 31 : 0)
}

// month index → "YYYY-MM" tick label
export function fmtMonth(idx: number): string {
  const y = Math.floor(idx / 12)
  const m = Math.round(idx % 12) + 1
  return `${y}-${String(m).padStart(2, "0")}`
}

// Classify a claim_type string (may carry parentheticals) into a tone bucket.
export type ClaimTone = "fact" | "reason" | "speculation"
export function claimTone(claimType: string): ClaimTone {
  if (claimType.includes("推测")) return "speculation"
  if (claimType.includes("推理")) return "reason"
  return "fact"
}
export const CLAIM_LABEL: Record<ClaimTone, string> = {
  fact: "事实",
  reason: "推理",
  speculation: "推测",
}
