// Zero-dependency SVG chart. Supports line / step / scatter series on a
// shared linear-x axis with linear or log y. Responsive via viewBox.

export interface Pt {
  x: number
  y: number
  label?: string
}
export interface ChartSeries {
  id: string
  color: string
  kind: "line" | "step" | "scatter"
  points: Pt[]
  dashed?: boolean
}
export interface ChartAnnotation {
  y: number
  label: string
}
export interface ChartProps {
  series: ChartSeries[]
  xTicks: { value: number; label: string }[]
  yScale?: "linear" | "log"
  yTickFormat?: (v: number) => string
  yDomain?: [number, number]
  height?: number
  annotations?: ChartAnnotation[]
  title: string
}

const W = 640
const PAD = { l: 54, r: 14, t: 14, b: 30 }

function extent(vals: number[]): [number, number] {
  return [Math.min(...vals), Math.max(...vals)]
}

export function linearTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min]
  const span = max - min
  const raw = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 0.5; v += step) ticks.push(Number(v.toFixed(6)))
  return ticks
}

function logTicks(min: number, max: number): number[] {
  const lo = Math.floor(Math.log10(min))
  const hi = Math.ceil(Math.log10(max))
  const ticks: number[] = []
  for (let e = lo; e <= hi; e++) ticks.push(Math.pow(10, e))
  return ticks
}

export function Chart({
  series,
  xTicks,
  yScale = "linear",
  yTickFormat,
  yDomain,
  height = 250,
  annotations = [],
  title,
}: ChartProps) {
  const H = height
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const allPts = series.flatMap((s) => s.points)
  // log axis can only represent y > 0; drop non-positive points from the domain
  // (and from rendering, via visiblePoints below)
  const isLog = yScale === "log"
  const usablePts = isLog ? allPts.filter((p) => p.y > 0) : allPts
  if (usablePts.length === 0) {
    return (
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <text x={W / 2} y={H / 2} className="chart-axis-label" textAnchor="middle">
          无可用数据
        </text>
      </svg>
    )
  }

  const [xMin, xMax] = extent(usablePts.map((p) => p.x))
  const annoY = annotations.map((a) => a.y).filter((y) => !isLog || y > 0)
  let [yMin, yMax] = yDomain ?? extent(usablePts.map((p) => p.y).concat(annoY))
  if (isLog && yMin <= 0) {
    yMin = Math.min(...usablePts.map((p) => p.y)) // guaranteed > 0
  }
  // zero-span domain (single value, or equal explicit yDomain) → expand so
  // Math.log10(hi)-Math.log10(lo) / (yMax-yMin) never divides by zero
  if (yMin === yMax) {
    if (isLog) {
      yMin = yMin / 10
      yMax = yMax * 10
    } else {
      const pad = Math.abs(yMin) * 0.08 || 1
      yMin -= pad
      yMax += pad
    }
  } else if (yScale === "linear" && !yDomain) {
    // pad linear domain a touch so points don't sit on the frame
    const pad = (yMax - yMin) * 0.08
    yMin -= pad
    yMax += pad
  }

  // points actually drawn (log drops non-positive)
  const visiblePoints = (s: ChartSeries): Pt[] => (isLog ? s.points.filter((p) => p.y > 0) : s.points)

  const sx = (x: number) => PAD.l + (xMax === xMin ? 0.5 : (x - xMin) / (xMax - xMin)) * iw
  const sy = (y: number) => {
    if (yScale === "log") {
      const lo = Math.log10(yMin)
      const hi = Math.log10(yMax)
      return PAD.t + (1 - (Math.log10(y) - lo) / (hi - lo)) * ih
    }
    return PAD.t + (1 - (y - yMin) / (yMax - yMin)) * ih
  }

  const yTicks = yScale === "log" ? logTicks(yMin, yMax) : linearTicks(yMin, yMax)
  const fmtY = yTickFormat ?? ((v: number) => String(v))

  function pathFor(s: ChartSeries): string {
    const pts = visiblePoints(s)
    if (pts.length === 0) return ""
    let d = `M ${sx(pts[0].x).toFixed(1)} ${sy(pts[0].y).toFixed(1)}`
    for (let i = 1; i < pts.length; i++) {
      const px = sx(pts[i].x).toFixed(1)
      const py = sy(pts[i].y).toFixed(1)
      if (s.kind === "step") {
        d += ` L ${px} ${sy(pts[i - 1].y).toFixed(1)} L ${px} ${py}`
      } else {
        d += ` L ${px} ${py}`
      }
    }
    return d
  }

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* y gridlines + labels */}
      {yTicks.map((t) => {
        const y = sy(t)
        if (y < PAD.t - 1 || y > H - PAD.b + 1) return null
        return (
          <g key={`y${t}`}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} className="chart-grid" />
            <text x={PAD.l - 6} y={y + 3} className="chart-axis-label" textAnchor="end">
              {fmtY(t)}
            </text>
          </g>
        )
      })}
      {/* x ticks */}
      {xTicks.map((t) => {
        const x = sx(t.value)
        if (x < PAD.l - 1 || x > W - PAD.r + 1) return null
        return (
          <text key={`x${t.value}`} x={x} y={H - PAD.b + 16} className="chart-axis-label" textAnchor="middle">
            {t.label}
          </text>
        )
      })}
      {/* annotations (horizontal threshold lines) — drop non-positive on log
          and any that fall outside the drawn y domain */}
      {annotations
        .filter((a) => (!isLog || a.y > 0) && a.y >= yMin && a.y <= yMax)
        .map((a, i) => {
        const y = sy(a.y)
        return (
          <g key={`a${i}`}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} className="chart-annotation-line" />
            <text x={W - PAD.r - 4} y={y - 4} className="chart-annotation-label" textAnchor="end">
              {a.label}
            </text>
          </g>
        )
      })}
      {/* series */}
      {series.map((s) =>
        s.kind === "scatter" ? null : (
          <path
            key={s.id}
            d={pathFor(s)}
            fill="none"
            stroke={s.color}
            strokeWidth={1.8}
            strokeDasharray={s.dashed ? "5 4" : undefined}
            strokeLinejoin="round"
          />
        ),
      )}
      {series.map((s) =>
        visiblePoints(s).map((p, i) => (
          <circle
            key={`${s.id}-${i}`}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={s.kind === "scatter" ? 4 : 2.4}
            fill={s.color}
            className="chart-dot"
          >
            {p.label ? <title>{p.label}</title> : null}
          </circle>
        )),
      )}
    </svg>
  )
}
