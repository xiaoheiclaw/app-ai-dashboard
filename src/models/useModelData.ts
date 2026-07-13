import { useEffect, useState } from "react"
import type { ModelData } from "./types"
import { DATA_FILES } from "./dataFiles"
import { assertModelData } from "./validate"

// Fetch keys → data/*.json filenames. Base is /app-ai-dashboard/ (Vite base),
// so full URL = `${import.meta.env.BASE_URL}data/<file>.json`.
const FILES = DATA_FILES

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: ModelData }

async function fetchJson(file: string, signal: AbortSignal): Promise<unknown> {
  const url = `${import.meta.env.BASE_URL}data/${file}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
  return res.json()
}

export function useModelData(): State {
  const [state, setState] = useState<State>({ status: "loading" })

  useEffect(() => {
    const controller = new AbortController()
    const keys = Object.keys(FILES) as (keyof ModelData)[]
    Promise.all(keys.map((k) => fetchJson(FILES[k], controller.signal)))
      .then((results) => {
        if (controller.signal.aborted) return
        const entries = keys.map((k, i) => [k, results[i]] as const)
        const data = assertModelData(Object.fromEntries(entries))
        setState({ status: "ready", data })
      })
      .catch((err: unknown) => {
        // an aborted fetch (unmount / re-run) is not a real error
        if (controller.signal.aborted) return
        setState({ status: "error", error: err instanceof Error ? err.message : String(err) })
      })
    return () => controller.abort()
  }, [])

  return state
}
