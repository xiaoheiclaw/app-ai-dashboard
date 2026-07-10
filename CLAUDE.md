# app-ai-dashboard

## What this is
LLM 进展看板：厂商×月份发布日历矩阵 + 行业技术突破时间轴。部署在 Avibe Show Page，本仓库是数据与组件的 source of truth。

## How to run
无需本地构建。改完 `src/` 后跑 `scripts/sync-to-show.sh` 推到 Show 工作区（`~/.avibe/show/ses5z98nxwktk/`），私有页热更新。
语法检查：`~/.avibe/show/ses5z98nxwktk/node_modules/.bin/esbuild src/*.ts src/*.tsx --loader:.tsx=tsx --outdir=/tmp/check --format=esm --jsx=automatic`

## Key files
- `src/data-*.ts` — 全部数据（见 README「更新数据」约定：claim 三态标注、benchmark 必须真实、preview 标记）
- `src/App.tsx` — 双 Tab UI（日历矩阵 + 时间轴 + 详情抽屉）
- `src/styles.css` — 全部样式（无 tailwind）

## 约束
- 数据更新是主要工作；UI 改动保持移动端可用（矩阵横向滚动、抽屉全屏）
- 新增发布条目前先核实：2026 命名很怪（Claude Fable 5、GPT-5.6 Sol/Terra/Luna 都是真的），而"大家都在等的"（DeepSeek R2、Grok 5、Llama 5）反而不存在——别凭直觉，查厂商一手源
- 闭源架构/算力一律 `推测`，除非官方声明
