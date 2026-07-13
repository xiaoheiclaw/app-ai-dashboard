import { Chart, linearTicks, type ChartSeries } from "./Chart"
import { DebateCard } from "./DebateCard"
import { useModelData } from "./useModelData"
import type { ModelData } from "./types"
import { Answer, ClaimBadge, Legend, QuestionBlock, safeHttpUrl, Sources } from "./ui"
import { monthIndex } from "./util"

const COLORS = {
  p50: "#5b8cff",
  p80: "#7c5cff",
  eci: "#5b8cff",
  open: "#34d399",
  closed: "#f59e0b",
  tierA: "#5b8cff",
  tierB: "#f472b6",
  lag: "#f59e0b",
  usage: "#34d399",
}

// year-boundary x ticks from a set of month indices
function yearTicks(idxs: number[]): { value: number; label: string }[] {
  if (idxs.length === 0) return [] // defensive: empty input → no axis labels, no NaN
  const min = Math.min(...idxs)
  const max = Math.max(...idxs)
  const ticks: { value: number; label: string }[] = []
  for (let y = Math.ceil(min / 12); y * 12 <= max; y++) {
    ticks.push({ value: y * 12, label: String(y) })
  }
  // range wholly within a year (no Jan boundary crossed) → fall back to
  // first/last month labels so the x-axis is never blank
  if (ticks.length === 0) {
    const fmt = (idx: number) => {
      const y = Math.floor(idx / 12)
      const m = Math.round(idx % 12) + 1
      return `${y}-${String(m).padStart(2, "0")}`
    }
    return min === max
      ? [{ value: min, label: fmt(min) }]
      : [
          { value: min, label: fmt(min) },
          { value: max, label: fmt(max) },
        ]
  }
  return ticks
}

function valueTicks(vals: number[], fmt: (n: number) => string) {
  if (vals.length === 0) return [] // defensive: empty input → no axis labels, no NaN
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  return linearTicks(min, max).map((v) => ({ value: v, label: fmt(v) }))
}

// time-series points must be x-ascending so a late-appended row doesn't
// make the polyline backtrack; scatter (non-temporal) is exempt
function byX<T extends { x: number }>(pts: T[]): T[] {
  return [...pts].sort((a, b) => a.x - b.x)
}

function fmtMinutes(v: number): string {
  if (v >= 1000) return `${Number((v / 1000).toFixed(1))}k`
  return String(Number(v.toFixed(2)))
}

// ── Q1: METR agent time horizon (log) ──────────────────────────────
function Q1({ d }: { d: ModelData["q1"] }) {
  const idxs = d.points.map((p) => monthIndex(p.date))
  const series: ChartSeries[] = [
    {
      id: "p50",
      color: COLORS.p50,
      kind: "line",
      points: byX(
        d.points.map((p) => ({
          x: monthIndex(p.date),
          y: p.p50_horizon_minutes,
          label: `${p.model} (${p.date}) · p50 ${p.p50_horizon_minutes}min`,
        })),
      ),
    },
    {
      id: "p80",
      color: COLORS.p80,
      kind: "line",
      dashed: true,
      points: byX(
        d.points.map((p) => ({
          x: monthIndex(p.date),
          y: p.p80_horizon_minutes,
          label: `${p.model} (${p.date}) · p80 ${p.p80_horizon_minutes}min`,
        })),
      ),
    },
  ]
  return (
    <QuestionBlock tag="Q1 · 能力时长" question={d.question}>
      <Answer text={d.current_answer.text} claimType={d.current_answer.claim_type} />
      <Legend
        items={[
          { color: COLORS.p50, label: "p50 时长(分钟)" },
          { color: COLORS.p80, label: "p80 时长(分钟)", dashed: true },
        ]}
      />
      <Chart
        title="METR agent 自主时长(对数轴,分钟)"
        series={series}
        xTicks={yearTicks(idxs)}
        yScale="log"
        yTickFormat={(v) => `${fmtMinutes(v)}m`}
        annotations={[{ y: 960, label: ">16h 测量不可靠" }]}
        height={270}
      />
      <p className="qblock-note">拟合翻倍时间 ≈ {d.doubling_time_days} 天。</p>
      {d.caveats.length > 0 && (
        <details className="caveats">
          <summary>口径与 caveat ({d.caveats.length})</summary>
          <ul>
            {d.caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </details>
      )}
      <Sources sources={d.sources} />
    </QuestionBlock>
  )
}

// ── Q2: ECI frontier step line ─────────────────────────────────────
function Q2({ d }: { d: ModelData["q2"] }) {
  const idxs = d.frontier_points.map((p) => monthIndex(p.date))
  const series: ChartSeries[] = [
    {
      id: "eci",
      color: COLORS.eci,
      kind: "step",
      points: byX(
        d.frontier_points.map((p) => ({
          x: monthIndex(p.date),
          y: p.score,
          label: `${p.model} (${p.date}) · ECI ${p.score}`,
        })),
      ),
    },
  ]
  return (
    <QuestionBlock tag="Q2 · 综合智能" question={d.question}>
      <Answer text={d.current_answer.text} claimType={d.current_answer.claim_type} />
      <Legend items={[{ color: COLORS.eci, label: `${d.index_name} 前沿刷新` }]} />
      <Chart
        title="Epoch Capabilities Index 前沿阶梯线"
        series={series}
        xTicks={yearTicks(idxs)}
        yScale="linear"
        yTickFormat={(v) => String(Math.round(v))}
        height={250}
      />
      <p className="qblock-note">{d.index_notes}</p>
      <Sources sources={d.sources} />
    </QuestionBlock>
  )
}

// ── Q3: intelligence × price scatter + tier price decline ──────────
function Q3({ d }: { d: ModelData["q3"] }) {
  const open = d.scatter.filter((s) => s.open_weights)
  const closed = d.scatter.filter((s) => !s.open_weights)
  const toPt = (s: (typeof d.scatter)[number]) => ({
    x: s.intelligence_index,
    y: s.price_usd_per_m_tokens_blended,
    label: `${s.model} · II ${s.intelligence_index} · $${s.price_usd_per_m_tokens_blended}`,
  })
  const scatterSeries: ChartSeries[] = [
    { id: "open", color: COLORS.open, kind: "scatter", points: open.map(toPt) },
    { id: "closed", color: COLORS.closed, kind: "scatter", points: closed.map(toPt) },
  ]
  const iiVals = d.scatter.map((s) => s.intelligence_index)

  const tierColors = [COLORS.tierA, COLORS.tierB]
  const tierIdxs = d.tier_decline.flatMap((t) => t.points.map((p) => monthIndex(p.date)))
  const tierSeries: ChartSeries[] = d.tier_decline.map((t, i) => ({
    id: `tier-${i}`,
    color: tierColors[i % tierColors.length],
    kind: "line",
    points: byX(
      t.points.map((p) => ({
        x: monthIndex(p.date),
        y: p.price_usd_per_m_tokens,
        label: `${p.model} (${p.date}) · $${p.price_usd_per_m_tokens}`,
      })),
    ),
  }))

  return (
    <QuestionBlock tag="Q3 · 智能单价" question={d.question}>
      <Answer text={d.current_answer.text} claimType={d.current_answer.claim_type} />
      <div className="chart-caption">当前模型:智能指数 × 挂牌价(对数轴)</div>
      <Legend
        items={[
          { color: COLORS.open, label: "开源权重" },
          { color: COLORS.closed, label: "闭源" },
        ]}
      />
      <Chart
        title="智能指数与价格散点(开源/闭源分色,价格对数轴)"
        series={scatterSeries}
        xTicks={valueTicks(iiVals, (v) => String(Math.round(v)))}
        yScale="log"
        yTickFormat={(v) => `$${v}`}
        height={260}
      />
      <div className="chart-caption">同智能档最低价随时间下降(对数轴)</div>
      <Legend items={d.tier_decline.map((t, i) => ({ color: tierColors[i % 2], label: t.tier }))} />
      <Chart
        title="同智能档位最低价格下降曲线(对数轴)"
        series={tierSeries}
        xTicks={yearTicks(tierIdxs)}
        yScale="log"
        yTickFormat={(v) => `$${v}`}
        height={240}
      />
      <Sources sources={d.sources} />
    </QuestionBlock>
  )
}

// ── Q4: reliability — qualitative cards, no curve ──────────────────
function Q4({ d }: { d: ModelData["q4"] }) {
  return (
    <QuestionBlock tag="Q4 · 生产可靠性" question={d.question}>
      <Answer text={d.current_answer.text} claimType={d.current_answer.claim_type} />
      <p className="why-no-curve">
        <strong>为何不画曲线:</strong> {d.why_no_curve}
      </p>
      <div className="reli-cards">
        {d.cards.map((c, i) => {
          const href = safeHttpUrl(c.source)
          return (
            <div className="reli-card" key={i}>
              <div className="reli-card-head">
                <ClaimBadge claimType={c.claim_type} />
                <span className="reli-claim">{c.claim}</span>
              </div>
              <p className="reli-evidence">{c.evidence}</p>
              {href ? (
                <a className="reli-src" href={href} target="_blank" rel="noreferrer noopener">
                  来源 ↗
                </a>
              ) : null}
            </div>
          )
        })}
      </div>
      <Sources sources={d.sources} />
    </QuestionBlock>
  )
}

// ── Q5: capability lag + usage share (two small charts side by side) ─
function Q5({ cap, use }: { cap: ModelData["q5cap"]; use: ModelData["q5use"] }) {
  const lagIdxs = cap.lag_series.map((p) => monthIndex(p.date))
  const lagSeries: ChartSeries[] = [
    {
      id: "lag",
      color: COLORS.lag,
      kind: "line",
      points: byX(
        cap.lag_series.map((p) => ({
          x: monthIndex(p.date),
          y: p.lag_months,
          label: `${p.date} · 滞后 ${p.lag_months} 月`,
        })),
      ),
    },
  ]
  const useIdxs = use.share_series.map((p) => monthIndex(p.month))
  const useSeries: ChartSeries[] = [
    {
      id: "usage",
      color: COLORS.usage,
      kind: "line",
      points: byX(
        use.share_series.map((p) => ({
          x: monthIndex(p.month),
          y: p.cn_model_share_pct,
          label: `${p.month} · ${p.cn_model_share_pct}%`,
        })),
      ),
    },
  ]
  return (
    <QuestionBlock tag="Q5 · 开源/中国追赶" question="开源/中国模型:能力差距 vs 使用侵蚀">
      <Answer text={cap.current_answer.text} claimType={cap.current_answer.claim_type} />
      <p className="q5-warn">⚠ 份额 ≠ 能力:左图是能力滞后,右图是使用份额,两者不可混为一谈。</p>
      <div className="q5-grid">
        <div className="q5-cell">
          <div className="chart-caption">能力滞后月数(对美国闭源前沿)</div>
          <Chart
            title="开源/中国对美国闭源前沿的能力滞后月数"
            series={lagSeries}
            xTicks={yearTicks(lagIdxs)}
            yScale="linear"
            yTickFormat={(v) => `${v}m`}
            height={220}
          />
        </div>
        <div className="q5-cell">
          <div className="chart-caption">OpenRouter 中国模型 token 份额 %</div>
          <Chart
            title="OpenRouter 上中国模型 token 使用份额"
            series={useSeries}
            xTicks={yearTicks(useIdxs)}
            yScale="linear"
            yTickFormat={(v) => `${v}%`}
            height={220}
          />
          <Answer text={use.current_answer.text} claimType={use.current_answer.claim_type} />
        </div>
      </div>
      <p className="qblock-note">{use.caveat}</p>
      <div className="two-sources">
        <Sources sources={cap.sources} />
        <Sources sources={use.sources} />
      </div>
    </QuestionBlock>
  )
}

// ── Q6: hardware — three indicator cards + paradigm map table ───────
function Q6({ d }: { d: ModelData["q6"] }) {
  return (
    <QuestionBlock tag="Q6 · 硬件传导" question={d.question}>
      <Answer text={d.current_answer.text} claimType={d.current_answer.claim_type} />
      <div className="hw-cards">
        {d.indicators.map((ind, i) => (
          <div className="hw-card" key={i}>
            <div className="hw-card-head">
              <span className="hw-name">{ind.name}</span>
              <ClaimBadge claimType={ind.claim_type} />
            </div>
            <p className="hw-trend">{ind.value_or_trend}</p>
          </div>
        ))}
      </div>
      <div className="paradigm-wrap">
        <table className="paradigm-table">
          <thead>
            <tr>
              <th>范式</th>
              <th>硬件效应</th>
              <th>证据</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {d.paradigm_map.map((row, i) => (
              <tr key={i}>
                <td className="pm-paradigm">{row.paradigm}</td>
                <td>{row.hardware_effect}</td>
                <td className="pm-evidence">{row.evidence}</td>
                <td>
                  <ClaimBadge claimType={row.claim_type} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Sources sources={d.sources} />
    </QuestionBlock>
  )
}

export function ModelsTab() {
  const state = useModelData()

  if (state.status === "loading") {
    return <div className="models-status">加载数据中…</div>
  }
  if (state.status === "error") {
    return (
      <div className="models-status models-error">
        数据加载失败:{state.error}
        <br />
        <small>data/*.json 需可从 {import.meta.env.BASE_URL}data/ 访问</small>
      </div>
    )
  }

  const d = state.data
  // each JSON carries its own as_of; report the real range instead of trusting
  // q1, so updating one dataset can't silently misreport whole-page freshness
  const asOfs = [d.q1, d.q2, d.q3, d.q4, d.q5cap, d.q5use, d.q6, d.debates].map((x) => x.as_of)
  const minAsOf = asOfs.reduce((a, b) => (a < b ? a : b))
  const maxAsOf = asOfs.reduce((a, b) => (a > b ? a : b))
  const asOfLabel = minAsOf === maxAsOf ? `数据截至 ${maxAsOf}` : `数据截至 ${minAsOf} – ${maxAsOf}（各数据集时点不一）`
  return (
    <div className="models-tab">
      <p className="models-intro">
        六个常青问题追踪模型进展({asOfLabel}),下方争论块记录尚未收敛的关键分歧。
      </p>
      <Q1 d={d.q1} />
      <Q2 d={d.q2} />
      <Q3 d={d.q3} />
      <Q4 d={d.q4} />
      <Q5 cap={d.q5cap} use={d.q5use} />
      <Q6 d={d.q6} />

      <section className="debates-section">
        <h2 className="debates-title">争论追踪</h2>
        <p className="debates-sub">尚未收敛的分歧,点开看正方/反方证据与当前判断。</p>
        {d.debates.debates.map((db) => (
          <DebateCard key={db.id} debate={db} />
        ))}
      </section>
    </div>
  )
}
