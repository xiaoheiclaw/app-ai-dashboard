import type { ReactNode } from "react"
import type { SourceRef } from "./types"
import { claimTone, CLAIM_LABEL } from "./util"

export function ClaimBadge({ claimType }: { claimType: string }) {
  const tone = claimTone(claimType)
  return (
    <span className={`claim-badge claim-${tone}`} title={claimType}>
      {CLAIM_LABEL[tone]}
    </span>
  )
}

// Only http(s) URLs are safe to put in href (guard against javascript:/data:
// or plain-text sources authored by research agents).
export function safeHttpUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null
  } catch {
    return null
  }
}

// Returns a safe URL (or null → render as plain text) plus a display name.
function sourceHref(s: SourceRef): { url: string | null; name: string } {
  if (typeof s === "string") {
    // string form may be "Name url" or a bare url; extract first http(s) token
    const m = s.match(/https?:\/\/\S+/)
    // trailing CJK/ASCII punctuation gets swallowed by \S+; strip it back off
    const candidate = m ? m[0].replace(/[),，。）、；;]+$/, "") : s
    const url = safeHttpUrl(candidate)
    const name = m ? s.slice(0, m.index).trim().replace(/[（(]$/, "") || candidate : s
    return { url, name }
  }
  return { url: safeHttpUrl(s.url), name: s.note ? `${s.name} — ${s.note}` : s.name }
}

export function Sources({ sources }: { sources: SourceRef[] }) {
  if (!sources || sources.length === 0) return null
  return (
    <details className="sources">
      <summary>来源 ({sources.length})</summary>
      <ul>
        {sources.map((s, i) => {
          const { url, name } = sourceHref(s)
          return (
            <li key={i}>
              {url ? (
                <a href={url} target="_blank" rel="noreferrer noopener">
                  {name || url}
                </a>
              ) : (
                <span className="source-text">{name}</span>
              )}
            </li>
          )
        })}
      </ul>
    </details>
  )
}

export function QuestionBlock({
  tag,
  question,
  children,
}: {
  tag: string
  question: string
  children: ReactNode
}) {
  return (
    <section className="qblock">
      <header className="qblock-head">
        <span className="qblock-tag">{tag}</span>
        <h3 className="qblock-q">{question}</h3>
      </header>
      {children}
    </section>
  )
}

export function Answer({ text, claimType }: { text: string; claimType: string }) {
  return (
    <p className="qblock-answer">
      <ClaimBadge claimType={claimType} />
      <span>{text}</span>
    </p>
  )
}

export function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="legend">
      {items.map((it, i) => (
        <span key={i} className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background: it.dashed ? "transparent" : it.color,
              borderBottom: it.dashed ? `2px dashed ${it.color}` : undefined,
            }}
          />
          {it.label}
        </span>
      ))}
    </div>
  )
}
