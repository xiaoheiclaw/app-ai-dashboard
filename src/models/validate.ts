import type { ModelData } from "./types"

// Lightweight hand-written guards: verify each fetched file has the required
// arrays/objects the UI reads, so a missing/drifted field surfaces as a clean
// error state instead of a mid-render `undefined.map` / `undefined.includes`.

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}
function isStr(v: unknown): v is string {
  return typeof v === "string"
}
function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v)
}
function arr(v: unknown, key: string): unknown[] | null {
  return isObj(v) && Array.isArray(v[key]) ? (v[key] as unknown[]) : null
}
// current_answer / current_view: both text and claim_type feed ClaimBadge.includes()
function okAnswer(v: unknown, key = "current_answer"): boolean {
  const a = isObj(v) ? v[key] : undefined
  return isObj(a) && isStr(a.text) && isStr(a.claim_type)
}
function every(v: unknown, key: string, pred: (x: unknown) => boolean): boolean {
  const a = arr(v, key)
  return a !== null && a.every(pred)
}

const CHECKS: Record<keyof ModelData, (v: unknown) => boolean> = {
  q1: (v) =>
    every(v, "points", (p) => isObj(p) && isStr(p.date) && isNum(p.p50_horizon_minutes) && isNum(p.p80_horizon_minutes)) &&
    arr(v, "sources") !== null &&
    Array.isArray((v as Record<string, unknown>).caveats) &&
    okAnswer(v),
  q2: (v) =>
    every(v, "frontier_points", (p) => isObj(p) && isStr(p.date) && isNum(p.score)) &&
    arr(v, "sources") !== null &&
    okAnswer(v),
  q3: (v) =>
    every(v, "scatter", (s) => isObj(s) && isNum(s.intelligence_index) && isNum(s.price_usd_per_m_tokens_blended) && typeof s.open_weights === "boolean") &&
    every(v, "tier_decline", (t) => isObj(t) && isStr(t.tier) && Array.isArray(t.points) && (t.points as unknown[]).every((p) => isObj(p) && isStr(p.date) && isNum(p.price_usd_per_m_tokens))) &&
    okAnswer(v),
  q4: (v) =>
    every(v, "cards", (c) => isObj(c) && isStr(c.claim) && isStr(c.evidence) && isStr(c.claim_type) && isStr(c.source)) &&
    isObj(v) && isStr(v.why_no_curve) &&
    okAnswer(v),
  q5cap: (v) =>
    every(v, "lag_series", (p) => isObj(p) && isStr(p.date) && isNum(p.lag_months)) &&
    arr(v, "sources") !== null &&
    okAnswer(v),
  q5use: (v) =>
    every(v, "share_series", (p) => isObj(p) && isStr(p.month) && isNum(p.cn_model_share_pct)) &&
    isObj(v) && isStr(v.caveat) &&
    okAnswer(v),
  q6: (v) =>
    every(v, "indicators", (i) => isObj(i) && isStr(i.name) && isStr(i.value_or_trend) && isStr(i.claim_type)) &&
    every(v, "paradigm_map", (r) => isObj(r) && isStr(r.paradigm) && isStr(r.hardware_effect) && isStr(r.claim_type)) &&
    okAnswer(v),
  debates: (v) =>
    every(v, "debates", (d) => {
      if (!isObj(d)) return false
      const sideOk = (s: unknown) => isObj(s) && isStr(s.position) && Array.isArray(s.evidence)
      return isStr(d.id) && isStr(d.title) && isStr(d.affects) && sideOk(d.side_a) && sideOk(d.side_b) && okAnswer(d, "current_view")
    }),
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
