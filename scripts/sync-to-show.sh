#!/bin/bash
# repo → Avibe Show 工作区（私有页热更新）
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SHOW_DIR="$HOME/.avibe/show/ses5z98nxwktk"

if [ ! -d "$SHOW_DIR/src" ]; then
  echo "Show 工作区不存在: $SHOW_DIR" >&2
  exit 1
fi

cp "$REPO_DIR"/src/{App.tsx,data.ts,data-us.ts,data-gmxm.ts,data-cn.ts,data-milestones.ts,styles.css} "$SHOW_DIR/src/"
echo "已同步 → $SHOW_DIR/src/"

# 语法检查
"$SHOW_DIR/node_modules/.bin/esbuild" "$SHOW_DIR"/src/App.tsx "$SHOW_DIR"/src/data*.ts \
  --loader:.tsx=tsx --loader:.ts=ts --outdir=/tmp/ai-dashboard-check --format=esm --jsx=automatic >/dev/null
echo "esbuild 语法检查通过 ✓"
