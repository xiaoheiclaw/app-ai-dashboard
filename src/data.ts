// LLM 进展看板 — 数据层（v2 内容加厚版）
// 2024-01 → 2026-07；2026 年条目及全部 benchmark/价格经 4 个独立研究 agent 多源核实（2026-07-06）。
// claim 标注：事实=技术报告/官方 · 推理=基于事实的推断 · 推测=闭源黑箱/单源未证。

import { RELEASES_US } from "./data-us"
import { RELEASES_GMXM } from "./data-gmxm"
import { RELEASES_CN } from "./data-cn"
import { MILESTONES_FULL } from "./data-milestones"

export type Claim = "事实" | "推理" | "推测"

export interface Release {
  vendor: string        // 对应 VENDORS.key
  date: string          // YYYY-MM
  name: string
  tier: "major" | "minor"
  headline: string      // 一句话核心创新（格子里显示）
  approxDate?: boolean  // 月份待核
  preview?: boolean     // 仅预览/受限，未 GA
  architecture: string
  archClaim?: Claim
  capability: string
  capClaim?: Claim
  price: string         // $/1M tokens in/out
  compute: string       // 训练算力 / 芯片 / 成本 / 开源
  computeClaim?: Claim
}

export interface Vendor {
  key: string
  label: string
  color: string
}

export interface Milestone {
  date: string
  title: string
  who: string
  what: string
  why: string
  tag: "架构" | "范式" | "成本" | "市场"
}

export const VENDORS: Vendor[] = [
  { key: "openai", label: "OpenAI", color: "#10a37f" },
  { key: "anthropic", label: "Anthropic", color: "#d97757" },
  { key: "google", label: "Google", color: "#4285f4" },
  { key: "meta", label: "Meta", color: "#0866ff" },
  { key: "deepseek", label: "DeepSeek", color: "#7c6cff" },
  { key: "qwen", label: "阿里 Qwen", color: "#f0662e" },
  { key: "xai", label: "xAI", color: "#111827" },
  { key: "kimi", label: "月之暗面 Kimi", color: "#e0338a" },
  { key: "mistral", label: "Mistral", color: "#fa5111" },
]

// 时间范围（行）：2024-01 → 2026-07，倒序显示
export const MONTH_START = "2024-01"
export const MONTH_END = "2026-07"

export const RELEASES: Release[] = [
  ...RELEASES_US,
  ...RELEASES_GMXM,
  ...RELEASES_CN,
]

export const MILESTONES: Milestone[] = MILESTONES_FULL
