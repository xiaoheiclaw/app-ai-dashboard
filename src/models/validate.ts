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
// strictly positive finite number — for values plotted on a log axis, where
// <= 0 has no representation and must be rejected at load (not silently dropped)
function isPos(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0
}
// non-negative finite number (e.g. lag in months — never < 0)
function isNonNeg(v: unknown): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= 0
}
// a percentage share in [0, 100]
function isPct(v: unknown): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100
}
// "YYYY-MM" or "YYYY-MM-DD" with a real, existing calendar date; these feed
// monthIndex() → chart x coords, so "2026-Q3" / "2026-02-31" must be rejected
// at load, not silently become NaN mid-render.
function isDateLike(v: unknown): boolean {
  if (!isStr(v)) return false
  const m = v.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
  if (!m) return false
  const year = Number(m[1])
  const month = Number(m[2])
  if (month < 1 || month > 12) return false
  if (m[3] === undefined) return true // YYYY-MM
  const day = Number(m[3])
  if (day < 1 || day > 31) return false
  // reject impossible days (2026-02-31 etc.) via a UTC round-trip
  const dt = new Date(Date.UTC(year, month - 1, day))
  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day
}
// strict zero-padded YYYY-MM-DD (real date) — as_of is compared lexicographically
// as a proxy for chronological order, which only holds for zero-padded ISO dates
function isFullDate(v: unknown): boolean {
  return isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && isDateLike(v)
}
function fullDate(v: unknown, key: string): boolean {
  return isObj(v) && isFullDate(v[key])
}
// array of strings (rendered directly as React children)
function strArr(v: unknown): boolean {
  return Array.isArray(v) && v.every(isStr)
}
// non-empty array whose every element passes pred — for chart-essential series,
// so an empty series can't reach yearTicks()/valueTicks() and produce NaN axes
function everyNonEmpty(v: unknown, key: string, pred: (x: unknown) => boolean): boolean {
  const a = isObj(v) && Array.isArray(v[key]) ? (v[key] as unknown[]) : null
  return a !== null && a.length > 0 && a.every(pred)
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
    fullDate(v, "as_of") &&
    str(v, "question") &&
    // p50/p80 are on a log axis → strictly positive; and the 80% success horizon
    // is a stricter threshold than 50%, so it is always the SHORTER time (p50 >= p80)
    everyNonEmpty(v, "points", (p) => {
      if (!isObj(p)) return false
      const p50 = p.p50_horizon_minutes
      const p80 = p.p80_horizon_minutes
      return isStr(p.model) && isDateLike(p.date) && isPos(p50) && isPos(p80) && p50 >= p80
    }) &&
    isNum((v as Record<string, unknown>).doubling_time_days) &&
    strArr((v as Record<string, unknown>).caveats) &&
    sourcesOk(v) &&
    okAnswer(v),
  q2: (v) =>
    fullDate(v, "as_of") &&
    str(v, "question") &&
    str(v, "index_name") &&
    str(v, "index_notes") &&
    everyNonEmpty(v, "frontier_points", (p) => isObj(p) && isStr(p.model) && isDateLike(p.date) && isNum(p.score)) &&
    sourcesOk(v) &&
    okAnswer(v),
  q3: (v) =>
    fullDate(v, "as_of") &&
    str(v, "question") &&
    // price is on a log axis (scatter y + tier decline) → strictly positive
    everyNonEmpty(v, "scatter", (s) => isObj(s) && isStr(s.model) && isNum(s.intelligence_index) && isPos(s.price_usd_per_m_tokens_blended) && isBool(s.open_weights)) &&
    everyNonEmpty(v, "tier_decline", (t) => isObj(t) && isStr(t.tier) && Array.isArray(t.points) && (t.points as unknown[]).length > 0 && (t.points as unknown[]).every((p) => isObj(p) && isStr(p.model) && isDateLike(p.date) && isPos(p.price_usd_per_m_tokens))) &&
    sourcesOk(v) &&
    okAnswer(v),
  q4: (v) =>
    fullDate(v, "as_of") &&
    str(v, "question") &&
    every(v, "cards", (c) => isObj(c) && isStr(c.claim) && isStr(c.evidence) && isStr(c.claim_type) && isStr(c.source)) &&
    str(v, "why_no_curve") &&
    sourcesOk(v) &&
    okAnswer(v),
  q5cap: (v) =>
    fullDate(v, "as_of") &&
    everyNonEmpty(v, "lag_series", (p) => isObj(p) && isDateLike(p.date) && isNonNeg(p.lag_months)) &&
    sourcesOk(v) &&
    okAnswer(v),
  q5use: (v) =>
    fullDate(v, "as_of") &&
    everyNonEmpty(v, "share_series", (p) => isObj(p) && isDateLike(p.month) && isPct(p.cn_model_share_pct)) &&
    str(v, "caveat") &&
    sourcesOk(v) &&
    okAnswer(v),
  q6: (v) =>
    fullDate(v, "as_of") &&
    str(v, "question") &&
    every(v, "indicators", (i) => isObj(i) && isStr(i.name) && isStr(i.value_or_trend) && isStr(i.claim_type)) &&
    every(v, "paradigm_map", (r) => isObj(r) && isStr(r.paradigm) && isStr(r.hardware_effect) && isStr(r.evidence) && isStr(r.claim_type)) &&
    sourcesOk(v) &&
    okAnswer(v),
  debates: (v) =>
    fullDate(v, "as_of") &&
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
