import { useEffect, useState } from "react"
import type { ModelData } from "./types"
import { assertModelData } from "./validate"

// Fetch keys → data/*.json filenames. Base is /app-ai-dashboard/ (Vite base),
// so full URL = `${import.meta.env.BASE_URL}data/<file>.json`.
const FILES: Record<keyof ModelData, string> = {
  q1: "q1_metr.json",
  q2: "q2_intelligence.json",
  q3: "q3_price.json",
  q4: "q4_reliability.json",
  q5cap: "q5_gap_capability.json",
  q5use: "q5_gap_usage.json",
  q6: "q6_hardware.json",
  debates: "debates.json",
}

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: ModelData }

async function fetchJson(file: string): Promise<unknown> {
  const url = `${import.meta.env.BASE_URL}data/${file}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
  return res.json()
}

export function useModelData(): State {
  const [state, setState] = useState<State>({ status: "loading" })

  useEffect(() => {
    let cancelled = false
    const keys = Object.keys(FILES) as (keyof ModelData)[]
    Promise.all(keys.map((k) => fetchJson(FILES[k])))
      .then((results) => {
        if (cancelled) return
        const entries = keys.map((k, i) => [k, results[i]] as const)
        const data = assertModelData(Object.fromEntries(entries))
        setState({ status: "ready", data })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({ status: "error", error: err instanceof Error ? err.message : String(err) })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
