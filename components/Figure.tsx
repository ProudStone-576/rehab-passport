import { FIGURES, L, add, dir, type Frame, type Pose, type Prop, type Pt } from "@/lib/figures";

export const W = 130;
export const H = 115;
const INK = "#13294b";
const FAR = "#9fb3c4";
const PROP = "#8a97a3";
export const ACCENT = "#0e9ca5";

function line(a: Pt, b: Pt, color: string, w: number, key: string) {
  return <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />;
}

export function skeleton(p: Pose) {
  const pin = p.pin ?? {};
  const neck = add(p.hip, dir(p.torso, L.torso));
  const shoulder = add(p.hip, dir(p.torso, L.shoulder));
  const head = add(add(neck, dir(p.head ?? p.torso, L.neck + L.head)), p.headShift ?? [0, 0]);
  const legPts = (leg: [number, number, number], k: Pt | undefined, a: Pt | undefined, t: Pt | undefined) => {
    const knee = k ?? add(p.hip, dir(leg[0], L.thigh));
    const ankle = a ?? add(knee, dir(leg[1], L.shin));
    const toe = t ?? add(ankle, dir(leg[2], L.foot));
    return [knee, ankle, toe] as const;
  };
  const armPts = (arm: [number, number], e?: Pt, h?: Pt) => {
    const elbow = e ?? add(shoulder, dir(arm[0], L.upper));
    const hand = h ?? add(elbow, dir(arm[1], L.fore));
    return [elbow, hand] as const;
  };
  return {
    neck, shoulder, head,
    leg: legPts(p.leg, pin.knee, pin.ankle, pin.toe),
    leg2: p.leg2 ? legPts(p.leg2, pin.knee2, pin.ankle2, pin.toe2) : null,
    arm: armPts(p.arm, pin.elbow, pin.hand),
    arm2: p.arm2 ? armPts(p.arm2) : null,
  };
}

export function propEl(pr: Prop, i: number, marker: string) {
  const k = `p${i}`;
  switch (pr.kind) {
    case "floor":
      return line([4, 110], [W - 4, 110], PROP, 1.5, k);
    case "mat":
      return <rect key={k} x={6} y={100} width={W - 12} height={6} rx={3} fill="#dfe7ec" stroke={PROP} strokeWidth={1} />;
    case "chair": {
      const x = pr.x;
      return (
        <g key={k} stroke={PROP} strokeWidth={2.5} strokeLinecap="round" fill="none">
          <path d={`M${x} 52 L${x} 110 M${x} 87 L${x + 30} 87 L${x + 30} 110`} />
        </g>
      );
    }
    case "table":
      return (
        <g key={k} stroke={PROP} strokeWidth={2.5} strokeLinecap="round">
          <line x1={pr.x1} y1={pr.y} x2={pr.x2} y2={pr.y} />
          <line x1={pr.x1 + 4} y1={pr.y} x2={pr.x1 + 4} y2={110} />
          <line x1={pr.x2 - 4} y1={pr.y} x2={pr.x2 - 4} y2={110} />
        </g>
      );
    case "wall":
      return (
        <g key={k}>
          <rect x={pr.x} y={2} width={6} height={108} fill="#dfe7ec" />
          <line x1={pr.x} y1={2} x2={pr.x} y2={110} stroke={PROP} strokeWidth={1.5} />
        </g>
      );
    case "towel":
      return <ellipse key={k} cx={pr.at[0]} cy={pr.at[1]} rx={7} ry={4.5} fill="#f4d9a8" stroke="#c49a52" strokeWidth={1} />;
    case "arrow":
      return <path key={k} d={pr.d} stroke={ACCENT} strokeWidth={2.2} fill="none" markerEnd={`url(#${marker})`} />;
    case "circle":
      return (
        <path key={k} d={`M${pr.at[0] + pr.r} ${pr.at[1]} A${pr.r} ${pr.r * 0.55} 0 1 1 ${pr.at[0] + pr.r * 0.7} ${pr.at[1] - pr.r * 0.4}`}
          stroke={ACCENT} strokeWidth={2.2} fill="none" markerEnd={`url(#${marker})`} />
      );
    case "gap":
      return <path key={k} d={pr.d} stroke={ACCENT} strokeWidth={1.6} strokeDasharray="3 2" fill="none" />;
  }
}

export function FrameSvg({ frame, x, marker }: { frame: Frame; x: number; marker: string }) {
  const s = skeleton(frame.pose);
  const back = frame.props.filter((p) => p.kind !== "arrow" && p.kind !== "circle");
  const front = frame.props.filter((p) => p.kind === "arrow" || p.kind === "circle");
  return (
    <g transform={`translate(${x} 0)`}>
      {back.map((p, i) => propEl(p, i, marker))}
      {s.leg2 && [line(frame.pose.hip, s.leg2[0], FAR, 5, "l2a"), line(s.leg2[0], s.leg2[1], FAR, 5, "l2b"), line(s.leg2[1], s.leg2[2], FAR, 4, "l2c")]}
      {s.arm2 && [line(s.shoulder, s.arm2[0], FAR, 4.5, "a2a"), line(s.arm2[0], s.arm2[1], FAR, 4.5, "a2b")]}
      {line(frame.pose.hip, s.neck, INK, 6, "t")}
      {line(frame.pose.hip, s.leg[0], INK, 5.5, "la")}
      {line(s.leg[0], s.leg[1], INK, 5.5, "lb")}
      {line(s.leg[1], s.leg[2], INK, 4.5, "lc")}
      {line(s.shoulder, s.arm[0], INK, 4.5, "aa")}
      {line(s.arm[0], s.arm[1], INK, 4.5, "ab")}
      <circle cx={s.head[0]} cy={s.head[1]} r={L.head} fill="#fff" stroke={INK} strokeWidth={3} />
      {front.map((p, i) => propEl(p, i + 50, marker))}
    </g>
  );
}

/** Start → end illustration for a built-in exercise, or null if none exists. */
export default function Figure({
  exerciseId, height = 90, labels, frame,
}: { exerciseId: string; height?: number; labels?: [string, string]; frame?: 0 | 1 }) {
  const frames = FIGURES[exerciseId];
  if (!frames) return null;
  const marker = `arrow-${exerciseId}`;
  if (frame !== undefined) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} height={height} width={(height * W) / H} className="figure" role="img" aria-label="Exercise illustration">
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={ACCENT} />
          </marker>
        </defs>
        <FrameSvg frame={frames[frame]} x={0} marker={marker} />
      </svg>
    );
  }
  const gap = 14;
  return (
    <svg
      viewBox={`0 0 ${W * 2 + gap} ${H}`}
      height={height}
      width={(height * (W * 2 + gap)) / H}
      className="figure"
      role="img"
      aria-label="Exercise illustration: start and end position"
    >
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={ACCENT} />
        </marker>
      </defs>
      <FrameSvg frame={frames[0]} x={0} marker={marker} />
      <line x1={W + gap / 2} y1={10} x2={W + gap / 2} y2={H - 10} stroke="#d9e3e7" strokeWidth={1} strokeDasharray="3 3" />
      <FrameSvg frame={frames[1]} x={W + gap} marker={marker} />
      <g fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700">
        <circle cx={9} cy={9} r={7} fill={ACCENT} />
        <text x={9} y={12.5} textAnchor="middle" fill="#fff">1</text>
        <circle cx={W + gap + 9} cy={9} r={7} fill={ACCENT} />
        <text x={W + gap + 9} y={12.5} textAnchor="middle" fill="#fff">2</text>
        {labels && (
          <>
            <text x={21} y={12.5} fill="#5d6b7a" fontWeight="600">{labels[0]}</text>
            <text x={W + gap + 21} y={12.5} fill="#5d6b7a" fontWeight="600">{labels[1]}</text>
          </>
        )}
      </g>
    </svg>
  );
}
