import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import { readFileSync, readdirSync, copyFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"

// repo-root data/*.json is the source of truth for the dashboard.
// The app fetches it at runtime from `${BASE_URL}data/<file>.json`.
// This plugin (a) serves those files in `vite dev` and (b) copies them
// into `dist/data/` on build, so no second copy of the data lives in the tree.
function repoData(): Plugin {
  let dataDir = resolve(process.cwd(), "data")
  let buildDataDir = resolve(process.cwd(), "dist", "data")
  return {
    name: "repo-data",
    configResolved(config) {
      // honor Vite's root / build.outDir contract instead of hardcoding cwd+dist
      dataDir = resolve(config.root, "data")
      buildDataDir = resolve(config.root, config.build.outDir, "data")
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/\/data\/([\w.-]+\.json)(?:\?.*)?$/)
        if (!match) return next()
        try {
          const body = readFileSync(resolve(dataDir, match[1]))
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(body)
        } catch {
          next()
        }
      })
    },
    closeBundle() {
      mkdirSync(buildDataDir, { recursive: true })
      for (const file of readdirSync(dataDir)) {
        if (file.endsWith(".json")) {
          copyFileSync(resolve(dataDir, file), resolve(buildDataDir, file))
        }
      }
    },
  }
}

// GitHub Pages project site: https://<owner>.github.io/app-ai-dashboard/
export default defineConfig({
  base: "/app-ai-dashboard/",
  plugins: [react(), repoData()],
})
