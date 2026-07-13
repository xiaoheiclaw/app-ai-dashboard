// "YYYY-MM" (or "YYYY-MM-DD") → fractional month index since year 0, for x-axis.
export function monthIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number)
  return y * 12 + (m - 1) + (d ? (d - 1) / 31 : 0)
}

// Classify a claim_type string (may carry parentheticals) into a tone bucket.
// Most-cautious wins (推测 > 推理 > 事实). Unknown values are NOT silently
// downgraded to 事实 — they render neutrally so drift/typos stay visible.
export type ClaimTone = "fact" | "reason" | "speculation" | "unknown"
export function claimTone(claimType: string): ClaimTone {
  if (typeof claimType !== "string") return "unknown"
  if (claimType.includes("推测")) return "speculation"
  if (claimType.includes("推理")) return "reason"
  if (claimType.includes("事实")) return "fact"
  return "unknown"
}
export const CLAIM_LABEL: Record<ClaimTone, string> = {
  fact: "事实",
  reason: "推理",
  speculation: "推测",
  unknown: "未标注",
}
