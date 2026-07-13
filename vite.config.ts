import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import { readFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { DATA_FILENAMES } from "./src/models/dataFiles"

// repo-root data/*.json is the source of truth for the dashboard.
// The app fetches it at runtime from `${BASE_URL}data/<file>.json`.
// This plugin (a) serves those files in `vite dev` and (b) copies them into
// `dist/data/` on build. It uses an explicit allowlist (DATA_FILENAMES) so
// stray/draft/raw-scrape JSON in data/ is never served or published to Pages.
const ALLOWED = new Set(DATA_FILENAMES)
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
        // own EVERY /data/*.json request: non-allowlisted → 404 so Vite's static
        // middleware can't fall through and expose repo-root draft/raw JSON
        const file = match[1]
        if (!ALLOWED.has(file)) {
          res.statusCode = 404
          res.end("Not found")
          return
        }
        try {
          const body = readFileSync(resolve(dataDir, file))
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(body)
        } catch {
          res.statusCode = 404
          res.end("Not found")
        }
      })
    },
    closeBundle() {
      mkdirSync(buildDataDir, { recursive: true })
      for (const file of DATA_FILENAMES) {
        const src = resolve(dataDir, file)
        if (!existsSync(src)) {
          throw new Error(`repo-data: 缺少必需数据文件 ${file}(data/ 下未找到)`)
        }
        copyFileSync(src, resolve(buildDataDir, file))
      }
    },
  }
}

// GitHub Pages project site: https://<owner>.github.io/app-ai-dashboard/
export default defineConfig({
  base: "/app-ai-dashboard/",
  plugins: [react(), repoData()],
})
