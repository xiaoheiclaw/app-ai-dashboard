import type { ModelData } from "./types"

// Lightweight hand-written guards: verify each fetched file has the required
// arrays/objects the UI reads, so a missing/drifted field surfaces as a clean
// error state instead of a mid-render `undefined.map` crash.

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}
function hasArray(v: unknown, key: string): boolean {
  return isObj(v) && Array.isArray(v[key])
}
function hasAnswer(v: unknown): boolean {
  return isObj(v) && isObj(v.current_answer) && typeof v.current_answer.text === "string"
}

// key → predicate for that file's minimal contract
const CHECKS: Record<keyof ModelData, (v: unknown) => boolean> = {
  q1: (v) => hasArray(v, "points") && hasArray(v, "sources") && hasAnswer(v),
  q2: (v) => hasArray(v, "frontier_points") && hasArray(v, "sources") && hasAnswer(v),
  q3: (v) => hasArray(v, "scatter") && hasArray(v, "tier_decline") && hasAnswer(v),
  q4: (v) => hasArray(v, "cards") && isObj(v) && typeof v.why_no_curve === "string" && hasAnswer(v),
  q5cap: (v) => hasArray(v, "lag_series") && hasArray(v, "sources") && hasAnswer(v),
  q5use: (v) => hasArray(v, "share_series") && isObj(v) && typeof v.caveat === "string" && hasAnswer(v),
  q6: (v) => hasArray(v, "indicators") && hasArray(v, "paradigm_map") && hasAnswer(v),
  debates: (v) => hasArray(v, "debates"),
}

// Validate a fetched-and-keyed record; throws with the offending file on mismatch.
export function assertModelData(raw: Record<string, unknown>): ModelData {
  for (const key of Object.keys(CHECKS) as (keyof ModelData)[]) {
    if (!CHECKS[key](raw[key])) {
      throw new Error(`data 校验失败:${key} 字段缺失或类型漂移`)
    }
  }
  return raw as unknown as ModelData
}
