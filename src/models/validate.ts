import type { ModelData } from "./types"

// Lightweight hand-written guards: verify each fetched file has the required
// shape the UI reads, so a missing/drifted field surfaces as a clean error
// state instead of a mid-render crash (`undefined.map`, `undefined.includes`,
// or "Objects are not valid as a React child").

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}
function isStr(v: unknown): v is string {
  return typeof v === "string"
}
function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v)
}
function isBool(v: unknown): v is boolean {
  return typeof v === "boolean"
}
// array of strings (rendered directly as React children)
function strArr(v: unknown): boolean {
  return Array.isArray(v) && v.every(isStr)
}
// SourceRef: bare url string, or { name, url, note? } — url/name feed <a> + text
function sourceRef(v: unknown): boolean {
  if (isStr(v)) return true
  return isObj(v) && isStr(v.name) && isStr(v.url) && (v.note === undefined || isStr(v.note))
}
function sourcesOk(v: unknown, key = "sources"): boolean {
  const a = isObj(v) ? v[key] : undefined
  return Array.isArray(a) && a.every(sourceRef)
}
// current_answer / current_view: text + claim_type both feed the UI
function okAnswer(v: unknown, key = "current_answer"): boolean {
  const a = isObj(v) ? v[key] : undefined
  return isObj(a) && isStr(a.text) && isStr(a.claim_type)
}
function every(v: unknown, key: string, pred: (x: unknown) => boolean): boolean {
  const a = isObj(v) && Array.isArray(v[key]) ? (v[key] as unknown[]) : null
  return a !== null && a.every(pred)
}
// top-level string field
function str(v: unknown, key: string): boolean {
  return isObj(v) && isStr(v[key])
}

const CHECKS: Record<keyof ModelData, (v: unknown) => boolean> = {
  q1: (v) =>
    str(v, "as_of") &&
    str(v, "question") &&
    every(v, "points", (p) => isObj(p) && isStr(p.model) && isStr(p.date) && isNum(p.p50_horizon_minutes) && isNum(p.p80_horizon_minutes)) &&
    isNum((v as Record<string, unknown>).doubling_time_days) &&
    strArr((v as Record<string, unknown>).caveats) &&
    sourcesOk(v) &&
    okAnswer(v),
  q2: (v) =>
    str(v, "question") &&
    str(v, "index_name") &&
    str(v, "index_notes") &&
    every(v, "frontier_points", (p) => isObj(p) && isStr(p.model) && isStr(p.date) && isNum(p.score)) &&
    sourcesOk(v) &&
    okAnswer(v),
  q3: (v) =>
    str(v, "question") &&
    every(v, "scatter", (s) => isObj(s) && isStr(s.model) && isNum(s.intelligence_index) && isNum(s.price_usd_per_m_tokens_blended) && isBool(s.open_weights)) &&
    every(v, "tier_decline", (t) => isObj(t) && isStr(t.tier) && Array.isArray(t.points) && (t.points as unknown[]).every((p) => isObj(p) && isStr(p.model) && isStr(p.date) && isNum(p.price_usd_per_m_tokens))) &&
    sourcesOk(v) &&
    okAnswer(v),
  q4: (v) =>
    str(v, "question") &&
    every(v, "cards", (c) => isObj(c) && isStr(c.claim) && isStr(c.evidence) && isStr(c.claim_type) && isStr(c.source)) &&
    str(v, "why_no_curve") &&
    sourcesOk(v) &&
    okAnswer(v),
  q5cap: (v) =>
    every(v, "lag_series", (p) => isObj(p) && isStr(p.date) && isNum(p.lag_months)) &&
    sourcesOk(v) &&
    okAnswer(v),
  q5use: (v) =>
    every(v, "share_series", (p) => isObj(p) && isStr(p.month) && isNum(p.cn_model_share_pct)) &&
    str(v, "caveat") &&
    sourcesOk(v) &&
    okAnswer(v),
  q6: (v) =>
    str(v, "question") &&
    every(v, "indicators", (i) => isObj(i) && isStr(i.name) && isStr(i.value_or_trend) && isStr(i.claim_type)) &&
    every(v, "paradigm_map", (r) => isObj(r) && isStr(r.paradigm) && isStr(r.hardware_effect) && isStr(r.evidence) && isStr(r.claim_type)) &&
    sourcesOk(v) &&
    okAnswer(v),
  debates: (v) =>
    every(v, "debates", (d) => {
      if (!isObj(d)) return false
      const sideOk = (s: unknown) => isObj(s) && isStr(s.position) && strArr(s.evidence)
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
