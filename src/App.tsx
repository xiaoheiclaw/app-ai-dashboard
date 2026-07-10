import { useMemo, useState } from "react"
import { ThemeProvider } from "@avibe/show-ui/theme"
import {
  VENDORS, RELEASES, MILESTONES, MONTH_START, MONTH_END,
  type Release, type Claim, type Milestone,
} from "./data"

/* ---------- helpers ---------- */

function monthRange(start: string, end: string): string[] {
  const [sy, sm] = start.split("-").map(Number)
  const [ey, em] = end.split("-").map(Number)
  const out: string[] = []
  let y = sy, m = sm
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`)
    m++; if (m > 12) { m = 1; y++ }
  }
  return out
}

const CLAIM_STYLE: Record<Claim, { bg: string; fg: string }> = {
  "事实": { bg: "rgba(16,163,127,0.14)", fg: "#0a7a5c" },
  "推理": { bg: "rgba(217,151,0,0.16)", fg: "#a06a00" },
  "推测": { bg: "rgba(120,120,130,0.16)", fg: "#6b7280" },
}

const TAG_COLOR: Record<Milestone["tag"], string> = {
  "架构": "#7c6cff",
  "范式": "#10a37f",
  "成本": "#f0662e",
  "市场": "#e0338a",
}

function vendorOf(key: string) {
  return VENDORS.find((v) => v.key === key)!
}

function ClaimTag({ c }: { c?: Claim }) {
  if (!c) return null
  const s = CLAIM_STYLE[c]
  return <span className="claim" style={{ background: s.bg, color: s.fg }}>{c}</span>
}

/* ---------- detail drawer (四块) ---------- */

function DetailBlock({ icon, label, text, claim }: { icon: string; label: string; text: string; claim?: Claim }) {
  return (
    <div className="block">
      <div className="block-head">
        <span className="block-icon">{icon}</span>
        <span className="block-label">{label}</span>
        <ClaimTag c={claim} />
      </div>
      <p className="block-text">{text}</p>
    </div>
  )
}

function Drawer({ r, onClose }: { r: Release | null; onClose: () => void }) {
  if (!r) return null
  const v = vendorOf(r.vendor)
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={r.name}>
        <button className="drawer-close" onClick={onClose} aria-label="关闭">×</button>
        <div className="drawer-tags">
          <span className="vchip" style={{ background: v.color }}>{v.label}</span>
          <span className="mono">{r.date}</span>
          <span className={`tier tier-${r.tier}`}>{r.tier === "major" ? "重大版本" : "小迭代"}</span>
          {r.preview && <span className="preview">预览/受限</span>}
          {r.approxDate && <span className="preview">月份待核</span>}
        </div>
        <h2 className="drawer-title">{r.name}</h2>
        <p className="drawer-headline">{r.headline}</p>
        <div className="blocks">
          <DetailBlock icon="🏗" label="架构" text={r.architecture} claim={r.archClaim} />
          <DetailBlock icon="📊" label="能力" text={r.capability} claim={r.capClaim} />
          <DetailBlock icon="💰" label="价格 / 效率" text={r.price} />
          <DetailBlock icon="⚡" label="算力 / 成本" text={r.compute} claim={r.computeClaim} />
        </div>
      </aside>
    </>
  )
}

/* ---------- calendar matrix ---------- */

function CalendarView({ onPick }: { onPick: (r: Release) => void }) {
  const months = useMemo(() => monthRange(MONTH_START, MONTH_END).reverse(), [])
  const byCell = useMemo(() => {
    const m = new Map<string, Release[]>()
    for (const r of RELEASES) {
      const k = `${r.date}|${r.vendor}`
      const arr = m.get(k) ?? []
      arr.push(r)
      m.set(k, arr)
    }
    return m
  }, [])

  return (
    <div className="matrix-wrap">
      <table className="matrix">
        <thead>
          <tr>
            <th className="corner">月份</th>
            {VENDORS.map((v) => (
              <th key={v.key} className="vhead">
                <span className="vdot" style={{ background: v.color }} />
                {v.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((mo) => (
            <tr key={mo} className={mo.endsWith("-01") ? "yearband" : ""}>
              <th className="mhead mono">{mo}</th>
              {VENDORS.map((v) => {
                const rels = byCell.get(`${mo}|${v.key}`) ?? []
                return (
                  <td key={v.key} className={rels.length ? "cell filled" : "cell"}>
                    {rels.map((r) => (
                      <button
                        key={r.name}
                        className={`chip ${r.tier === "major" ? "chip-major" : "chip-minor"}`}
                        style={r.tier === "major"
                          ? { background: v.color, borderColor: v.color }
                          : { color: v.color, borderColor: v.color }}
                        onClick={() => onPick(r)}
                        title={r.headline}
                      >
                        {r.name.replace(/\s*\(.*\)/, "")}
                        {r.preview && <span className="chip-flag">·预览</span>}
                      </button>
                    ))}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- timeline ---------- */

function TimelineView() {
  const items = useMemo(() => [...MILESTONES].sort((a, b) => (a.date < b.date ? 1 : -1)), [])
  return (
    <div className="timeline">
      {items.map((m, i) => (
        <div className="tl-item" key={i}>
          <div className="tl-rail">
            <span className="tl-dot" style={{ background: TAG_COLOR[m.tag] }} />
            {i < items.length - 1 && <span className="tl-line" />}
          </div>
          <div className="tl-body">
            <div className="tl-meta">
              <span className="mono tl-date">{m.date}</span>
              <span className="tl-tag" style={{ background: TAG_COLOR[m.tag] }}>{m.tag}</span>
              <span className="tl-who">{m.who}</span>
            </div>
            <h3 className="tl-title">{m.title}</h3>
            <p className="tl-what">{m.what}</p>
            <p className="tl-why"><span className="tl-why-k">为什么重要 → </span>{m.why}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- app shell ---------- */

export default function App() {
  const [tab, setTab] = useState<"calendar" | "timeline">("calendar")
  const [sel, setSel] = useState<Release | null>(null)

  return (
    <ThemeProvider preset="zinc">
      <main className="app">
        <header className="hero">
          <div className="hero-top">
            <span className="hero-badge">LLM 进展看板 · v1</span>
            <span className="hero-range mono">{MONTH_START} → {MONTH_END}</span>
          </div>
          <h1 className="hero-title">大模型发布日历 &amp; 技术突破轴</h1>
          <p className="hero-sub">
            列＝厂商，行＝月份，点格子看「架构 / 能力 / 价格效率 / 算力成本」四块详情。
            闭源前沿的架构与算力多为 <b>推测</b>，已逐条标注。
          </p>
          <div className="tabs">
            <button className={tab === "calendar" ? "tab on" : "tab"} onClick={() => setTab("calendar")}>🗓 发布日历</button>
            <button className={tab === "timeline" ? "tab on" : "tab"} onClick={() => setTab("timeline")}>🧬 技术突破轴</button>
          </div>
          {tab === "calendar" && (
            <div className="legend">
              <span className="lg"><span className="lg-sw major" />重大版本</span>
              <span className="lg"><span className="lg-sw minor" />小迭代</span>
              <span className="lg"><span className="claim" style={{ background: CLAIM_STYLE["事实"].bg, color: CLAIM_STYLE["事实"].fg }}>事实</span></span>
              <span className="lg"><span className="claim" style={{ background: CLAIM_STYLE["推理"].bg, color: CLAIM_STYLE["推理"].fg }}>推理</span></span>
              <span className="lg"><span className="claim" style={{ background: CLAIM_STYLE["推测"].bg, color: CLAIM_STYLE["推测"].fg }}>推测</span></span>
              <span className="lg hint">← 左右滑动看全部厂商</span>
            </div>
          )}
        </header>

        {tab === "calendar" ? <CalendarView onPick={setSel} /> : <TimelineView />}

        <footer className="foot">
          数据：公开发布 + 技术报告；2026 年经独立研究 agent 多源核实。
          仅供投研参考，闭源细节以厂商一手为准。
        </footer>

        <Drawer r={sel} onClose={() => setSel(null)} />
      </main>
    </ThemeProvider>
  )
}
