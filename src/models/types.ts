// Runtime shapes of data/*.json (the source of truth). Kept intentionally
// loose — the JSON is authored by research agents and we only read it.

export type ClaimType = string // "事实" / "推理" / "推测" (often with parenthetical qualifiers)

export interface CurrentAnswer {
  text: string
  claim_type: ClaimType
}

// sources come in two shapes across files: bare URL strings, or {name,url,note}
export type SourceRef = string | { name: string; url: string; note?: string }

// q1_metr.json
export interface MetrPoint {
  model: string
  date: string
  p50_horizon_minutes: number
  p80_horizon_minutes: number
}
export interface MetrData {
  as_of: string
  question: string
  sources: SourceRef[]
  points: MetrPoint[]
  doubling_time_days: number
  caveats: string[]
  current_answer: CurrentAnswer
}

// q2_intelligence.json
export interface FrontierPoint {
  date: string
  model: string
  score: number
}
export interface IntelligenceData {
  as_of: string
  question: string
  sources: SourceRef[]
  index_name: string
  index_notes: string
  index_components: string[]
  frontier_points_notes: string
  frontier_points: FrontierPoint[]
  current_answer: CurrentAnswer
}

// q3_price.json
export interface ScatterPoint {
  model: string
  vendor: string
  intelligence_index: number
  price_usd_per_m_tokens_blended: number
  open_weights: boolean
  release_date: string
}
export interface TierPoint {
  date: string
  model: string
  price_usd_per_m_tokens: number
  intelligence_index: number
  ii_estimated?: boolean
}
export interface TierDecline {
  tier: string
  points: TierPoint[]
  decline_note: string
}
export interface PriceData {
  as_of: string
  question: string
  sources: SourceRef[]
  scatter: ScatterPoint[]
  tier_decline: TierDecline[]
  current_answer: CurrentAnswer
}

// q4_reliability.json
export interface ReliabilityCard {
  claim: string
  evidence: string
  claim_type: ClaimType
  source: string
}
export interface ReliabilityData {
  as_of: string
  question: string
  sources: SourceRef[]
  cards: ReliabilityCard[]
  why_no_curve: string
  current_answer: CurrentAnswer
}

// q5_gap_capability.json
export interface LagPoint {
  date: string
  lag_months: number
  basis: string
}
export interface FlagshipComparison {
  cn_model: string
  us_model: string
  gap_note: string
  claim_type: ClaimType
}
export interface GapCapabilityData {
  as_of: string
  question_part: string
  sources: SourceRef[]
  method_note: string
  lag_series: LagPoint[]
  latest_flagship_comparison: FlagshipComparison[]
  current_answer: CurrentAnswer
}

// q5_gap_usage.json
export interface SharePoint {
  month: string
  cn_model_share_pct: number
  basis: string
}
export interface GapUsageData {
  as_of: string
  question_part: string
  sources: SourceRef[]
  share_series: SharePoint[]
  notable_facts: string[]
  caveat: string
  current_answer: CurrentAnswer
}

// q6_hardware.json
export interface HardwareIndicator {
  name: string
  value_or_trend: string
  claim_type: ClaimType
  source: string
}
export interface ParadigmMapRow {
  paradigm: string
  hardware_effect: string
  evidence: string
  claim_type: ClaimType
}
export interface HardwareData {
  as_of: string
  question: string
  sources: SourceRef[]
  indicators: HardwareIndicator[]
  paradigm_map: ParadigmMapRow[]
  current_answer: CurrentAnswer
}

// debates.json
export interface DebateSide {
  position: string
  evidence: string[]
}
export interface Debate {
  id: string
  title: string
  affects: string
  side_a: DebateSide
  side_b: DebateSide
  current_view: CurrentAnswer
  updated: string
}
export interface DebatesData {
  as_of: string
  debates: Debate[]
}

export interface ModelData {
  q1: MetrData
  q2: IntelligenceData
  q3: PriceData
  q4: ReliabilityData
  q5cap: GapCapabilityData
  q5use: GapUsageData
  q6: HardwareData
  debates: DebatesData
}
