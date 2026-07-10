# app-ai-dashboard

LLM 进展看板 —— 两个视角追踪大模型行业：

1. **发布日历矩阵**：列＝厂商（OpenAI/Anthropic/Google/Meta/DeepSeek/Qwen/xAI/Kimi/Mistral），行＝月份（2024-01→2026-07）。点格子看四块详情：🏗架构 / 📊能力 / 💰价格效率 / ⚡算力成本。每条 claim 标注 `事实/推理/推测`。
2. **技术突破时间轴**：24 个行业级拐点（MLA→o1 推理时计算→DeepSeek 时刻→MoE 默认→混合注意力→FP4→开闭源差距收窄→多智能体并行→Meta 弃开源…），按 架构/范式/成本/市场 四色分类。

## 数据

- 66 条发布 + 24 个里程碑，2026 年条目及全部 benchmark/价格经 4 个独立研究 agent 多源核实（2026-07-06）。
- 数据全部在 `src/data-*.ts`（纯 TS 对象，无外部依赖）：
  - `data.ts` — 类型定义 + 厂商表 + 汇总
  - `data-us.ts` — OpenAI + Anthropic
  - `data-gmxm.ts` — Google + Meta + xAI + Mistral
  - `data-cn.ts` — DeepSeek + Qwen + Kimi（技术报告透明，算力/成本多为事实级）
  - `data-milestones.ts` — 行业级技术突破时间轴

## 运行

当前部署在 Avibe Show Page（React/Vite 托管运行时）：

- 线上：https://dt-app.avibe.bot/show/ses5z98nxwktk/
- Show 工作区：`~/.avibe/show/ses5z98nxwktk/`（本仓库是数据与组件的 source of truth）

同步改动到线上：

```bash
scripts/sync-to-show.sh    # repo → show 工作区（私有页热更新）
```

> 注：`App.tsx` 依赖 Avibe show-runtime 的 `@avibe/show-ui/theme`。若将来要独立部署，
> 把 `ThemeProvider` 换掉即可（styles.css 已自带全部样式，无其他运行时依赖）。
> `src/index.html.ref` 是 show 工作区 app shell 的参考副本，勿直接使用。

## 更新数据

新发布/新里程碑直接编辑对应 `data-*.ts` 追加对象即可（接口见 `data.ts`）。
约定：闭源厂商的架构/算力标 `推测`；benchmark 数字必须是已发布的真实数据；未 GA 标 `preview: true`。
