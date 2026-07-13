import { useState } from "react"
import { ModelsTab } from "./models/ModelsTab"

// 骨架版:三 tab 壳 + 总览横幅占位。板块内容按实施顺序逐步填充:
//   1. 模型进展(6 问曲线 + 事件层 + 争论块)
//   2. 产业链瓶颈(瓶颈迁移地图)
//   3. 资本回报与公司脆弱度
// 设计文档: docs/specs/2026-07-10-ai-dashboard-design.md

const TABS = [
  { key: "models", label: "模型进展" },
  { key: "chain", label: "产业链瓶颈" },
  { key: "capital", label: "资本回报" },
] as const

type TabKey = (typeof TABS)[number]["key"]

function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="placeholder">
      <h2>{title}</h2>
      <p>{note}</p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<TabKey>("models")

  return (
    <div className="app">
      <header className="header">
        <h1>AI 赛道看板</h1>
        <p className="tagline">投资假设更新器 —— 能力曲线 · 瓶颈租金 · 资本回报 · 公司脆弱度</p>
      </header>

      <section className="banner">
        <span className="banner-label">本周假设变化</span>
        <span className="banner-empty">暂无 —— 数据管线上线后自动展示</span>
      </section>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "tab active" : "tab"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === "models" && <ModelsTab />}
        {tab === "chain" && (
          <Placeholder
            title="产业链瓶颈"
            note="瓶颈迁移地图建设中:芯片设计 → 代工 → HBM/存储 → 先进封装 → 服务器/网络 → 数据中心 → 电力 → 云 → 应用收入。各环节指标口径待专项研究定稿。"
          />
        )}
        {tab === "capital" && (
          <Placeholder
            title="资本回报与公司脆弱度"
            note="回本压力计算器 + 三层公司卡(超大云厂 / Neocloud / 薄资本中介)迁移中。"
          />
        )}
      </main>

      <footer className="footer">
        <span>claim 标注约定:事实 / 推理 / 推测</span>
      </footer>
    </div>
  )
}
