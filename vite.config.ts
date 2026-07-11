import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// GitHub Pages project site: https://<owner>.github.io/app-ai-dashboard/
export default defineConfig({
  base: "/app-ai-dashboard/",
  plugins: [react()],
})
