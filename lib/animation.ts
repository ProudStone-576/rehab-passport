import { FIGURES, L, add, dir, type Pose, type Pt } from "./figures";

// Turns each exercise's two drawn poses (start, end) into a looping movement.
// Joint ANGLES are blended, not joint positions, so limbs keep their length
// mid-move. Feet that stay on the floor are solved with two-bone IK, so they
// don't slide while the hips move (sit-to-stand, bridging).

type Plant = { bend: "forward" | "up" }; // which way the knee points
type Motion = { plant?: Plant; swing?: { base: number; amp: number }; alternate?: boolean };

export const MOTION: Record<string, Motion> = {
  "sit-to-stand": { plant: { bend: "forward" } },
  bridging: { plant: { bend: "up" } },
  pendulum: { swing: { base: 93, amp: 13 } },
  "seated-march": { alternate: true },
};

export type Phase = "start" | "move" | "hold" | "return";

/** Timeline in seconds for one repetition (before the speed factor). */
export function timeline(holdSeconds: number) {
  const t = { start: 0.6, move: 1.4, hold: Math.min(5, Math.max(0.5, holdSeconds)), back: 1.4 };
  return { ...t, total: t.start + t.move + t.hold + t.back };
}

export function holdFromText(hold?: string): number {
  const m = hold?.match(/(\d+)\s*s/i);
  return m ? Number(m[1]) : 0;
}

const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const lerpArr = <T extends number[]>(a: T, b: T, t: number) => a.map((v, i) => lerp(v, b[i], t)) as T;

/** Where each joint ends up for a pose (pins included), for blending pinned joints. */
function resolve(p: Pose) {
  const pin = p.pin ?? {};
  const shoulder = add(p.hip, dir(p.torso, L.shoulder));
  const knee = pin.knee ?? add(p.hip, dir(p.leg[0], L.thigh));
  const ankle = pin.ankle ?? add(knee, dir(p.leg[1], L.shin));
  const leg2 = p.leg2 ?? p.leg;
  const knee2 = pin.knee2 ?? add(p.hip, dir(leg2[0], L.thigh));
  const ankle2 = pin.ankle2 ?? add(knee2, dir(leg2[1], L.shin));
  const elbow = pin.elbow ?? add(shoulder, dir(p.arm[0], L.upper));
  const hand = pin.hand ?? add(elbow, dir(p.arm[1], L.fore));
  return { knee, ankle, toe: pin.toe ?? add(ankle, dir(p.leg[2], L.foot)), knee2, ankle2, toe2: pin.toe2 ?? add(ankle2, dir(leg2[2], L.foot)), elbow, hand };
}

/** Knee position for a hip and a planted ankle (two-bone IK). */
function solveKnee(hip: Pt, ankle: Pt, bend: Plant["bend"]): Pt {
  const dx = ankle[0] - hip[0];
  const dy = ankle[1] - hip[1];
  const d = Math.min(Math.hypot(dx, dy), L.thigh + L.shin - 0.01);
  const a = (L.thigh ** 2 - L.shin ** 2 + d ** 2) / (2 * d);
  const h = Math.sqrt(Math.max(0, L.thigh ** 2 - a ** 2));
  const ux = dx / d;
  const uy = dy / d;
  const mid: Pt = [hip[0] + a * ux, hip[1] + a * uy];
  const k1: Pt = [mid[0] - h * uy, mid[1] + h * ux];
  const k2: Pt = [mid[0] + h * uy, mid[1] - h * ux];
  if (bend === "forward") return k1[0] > k2[0] ? k1 : k2;
  return k1[1] < k2[1] ? k1 : k2;
}

const PIN_KEYS = ["knee", "ankle", "toe", "knee2", "ankle2", "toe2", "elbow", "hand"] as const;

/** The pose at blend t (0 = start, 1 = end). */
export function blendPose(exerciseId: string, t: number, swap = false): Pose {
  let [a, b] = FIGURES[exerciseId].map((f) => f.pose);
  if (swap) {
    const flip = (p: Pose): Pose => ({ ...p, leg: p.leg2 ?? p.leg, leg2: p.leg });
    a = flip(a);
    b = flip(b);
  }
  const ra = resolve(a);
  const rb = resolve(b);
  const pose: Pose = {
    hip: lerpPt(a.hip, b.hip, t),
    torso: lerp(a.torso, b.torso, t),
    head: lerp(a.head ?? a.torso, b.head ?? b.torso, t),
    headShift: lerpPt(a.headShift ?? [0, 0], b.headShift ?? [0, 0], t),
    leg: lerpArr(a.leg, b.leg, t),
    leg2: a.leg2 && b.leg2 ? lerpArr(a.leg2, b.leg2, t) : a.leg2,
    arm: lerpArr(a.arm, b.arm, t),
    arm2: a.arm2 && b.arm2 ? lerpArr(a.arm2, b.arm2, t) : a.arm2,
    pin: {},
  };
  // A joint pinned in either drawing is blended by position.
  for (const k of PIN_KEYS) {
    if (a.pin?.[k] || b.pin?.[k]) pose.pin![k] = lerpPt(ra[k], rb[k], t);
  }
  const m = MOTION[exerciseId];
  if (m?.plant) {
    pose.pin!.ankle = ra.ankle;
    pose.pin!.knee = solveKnee(pose.hip, ra.ankle, m.plant.bend);
    if (a.leg2) {
      pose.pin!.ankle2 = ra.ankle2;
      pose.pin!.knee2 = solveKnee(pose.hip, ra.ankle2, m.plant.bend);
    }
  }
  return pose;
}

export type AnimState = { pose: Pose; rep: number; phase: Phase; progress: number };

/** Everything to draw at `time` seconds into the loop. */
export function animate(exerciseId: string, time: number, reps: number, holdSeconds: number): AnimState {
  const m = MOTION[exerciseId];
  const total = Math.max(1, reps);
  if (m?.swing) {
    const period = 2.4;
    const angle = m.swing.base + m.swing.amp * Math.sin((2 * Math.PI * time) / period);
    const base = blendPose(exerciseId, 0);
    return {
      pose: { ...base, arm: [angle, angle] },
      rep: (Math.floor(time / period) % total) + 1,
      phase: "move",
      progress: 1,
    };
  }
  const tl = timeline(holdSeconds);
  const cycle = Math.floor(time / tl.total);
  const s = time - cycle * tl.total;
  let phase: Phase;
  let t: number;
  if (s < tl.start) [phase, t] = ["start", 0];
  else if (s < tl.start + tl.move) [phase, t] = ["move", ease((s - tl.start) / tl.move)];
  else if (s < tl.start + tl.move + tl.hold) [phase, t] = ["hold", 1];
  else [phase, t] = ["return", 1 - ease((s - tl.start - tl.move - tl.hold) / tl.back)];
  return { pose: blendPose(exerciseId, t, !!m?.alternate && cycle % 2 === 1), rep: (cycle % total) + 1, phase, progress: t };
}
