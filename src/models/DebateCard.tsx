import type { Debate } from "./types"
import { ClaimBadge } from "./ui"

export function DebateCard({ debate }: { debate: Debate }) {
  return (
    <details className="debate">
      <summary>
        <span className="debate-title">{debate.title}</span>
        <span className="debate-affects">影响 {debate.affects}</span>
      </summary>
      <div className="debate-body">
        <div className="debate-sides">
          <div className="debate-side side-a">
            <div className="side-head">正方</div>
            <p className="side-pos">{debate.side_a.position}</p>
            <ul>
              {debate.side_a.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
          <div className="debate-side side-b">
            <div className="side-head">反方</div>
            <p className="side-pos">{debate.side_b.position}</p>
            <ul>
              {debate.side_b.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="debate-view">
          <div className="debate-view-head">
            <span className="debate-view-label">当前判断</span>
            <ClaimBadge claimType={debate.current_view.claim_type} />
          </div>
          <p>{debate.current_view.text}</p>
        </div>
      </div>
    </details>
  )
}
