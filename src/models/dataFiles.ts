import type { ModelData } from "./types"

// The exact data/*.json files the dashboard reads. Single source of truth for
// both the runtime fetch (useModelData) and the build/serve allowlist
// (vite.config repoData plugin) — so stray/draft JSON never gets published.
export const DATA_FILES: Record<keyof ModelData, string> = {
  q1: "q1_metr.json",
  q2: "q2_intelligence.json",
  q3: "q3_price.json",
  q4: "q4_reliability.json",
  q5cap: "q5_gap_capability.json",
  q5use: "q5_gap_usage.json",
  q6: "q6_hardware.json",
  debates: "debates.json",
}

export const DATA_FILENAMES: string[] = Object.values(DATA_FILES)
