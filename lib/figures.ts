// Two-frame stick-figure illustrations (start → end) for the built-in exercises.
// Poses are side views built from joint angles (degrees, SVG axes: 0 = right,
// 90 = down, -90 = up), so a pose reads like a physio drawing: hip position,
// then the angle of each body segment. Any joint can be pinned with `pin`.

export type Pt = [number, number];

export type Pose = {
  hip: Pt;
  torso: number;
  head?: number; // neck → head direction, defaults to torso
  headShift?: Pt;
  leg: [number, number, number]; // thigh, shin, foot (near side, dark)
  leg2?: [number, number, number]; // far side, light
  arm: [number, number]; // upper arm, forearm
  arm2?: [number, number];
  pin?: Partial<Record<"knee" | "ankle" | "toe" | "knee2" | "ankle2" | "toe2" | "elbow" | "hand", Pt>>;
};

export type Prop =
  | { kind: "floor" }
  | { kind: "mat" }
  | { kind: "chair"; x: number }
  | { kind: "table"; x1: number; x2: number; y: number }
  | { kind: "wall"; x: number }
  | { kind: "towel"; at: Pt }
  | { kind: "arrow"; d: string }
  | { kind: "circle"; at: Pt; r: number }
  | { kind: "gap"; d: string };

export type Frame = { pose: Pose; props: Prop[] };

export const L = { torso: 32, shoulder: 29, neck: 5, head: 8, thigh: 25, shin: 23, foot: 8, upper: 17, fore: 16 };

export function dir(deg: number, len: number): Pt {
  const r = (deg * Math.PI) / 180;
  return [Math.cos(r) * len, Math.sin(r) * len];
}

export function add(a: Pt, b: Pt): Pt {
  return [a[0] + b[0], a[1] + b[1]];
}

// ---- base poses ---------------------------------------------------------

const standing = (x: number, extra: Partial<Pose> = {}): Pose => ({
  hip: [x, 59], torso: -90, leg: [90, 90, 0], leg2: [90, 90, 0], arm: [90, 90], arm2: [90, 90], ...extra,
});

const sitting = (extra: Partial<Pose> = {}): Pose => ({
  hip: [56, 83], torso: -90, leg: [0, 90, 0], leg2: [0, 90, 0], arm: [70, 10], ...extra,
});

const supineStraight = (extra: Partial<Pose> = {}): Pose => ({
  hip: [72, 96], torso: 180, leg: [0, 0, -90], leg2: [0, 0, -90], arm: [4, 0], ...extra,
});

const supineBent = (extra: Partial<Pose> = {}): Pose => ({
  hip: [72, 96], torso: 180, leg: [-50, 65, 0], leg2: [-50, 65, 0], arm: [4, 0], ...extra,
});

const CHAIR: Prop = { kind: "chair", x: 34 };
const MAT: Prop = { kind: "mat" };
const FLOOR: Prop = { kind: "floor" };

export const FIGURES: Record<string, [Frame, Frame]> = {
  "sit-to-stand": [
    { pose: sitting({ torso: -78, arm: [15, 0] }), props: [FLOOR, CHAIR] },
    { pose: standing(81, { arm: [80, 90], arm2: [80, 90] }), props: [FLOOR, CHAIR, { kind: "arrow", d: "M104 92 L104 58" }] },
  ],
  "heel-raises": [
    { pose: standing(60, { arm: [50, 20], arm2: [50, 20] }), props: [FLOOR, { kind: "table", x1: 82, x2: 124, y: 50 }] },
    {
      pose: standing(60, { hip: [60, 55], leg: [90, 90, 50], leg2: [90, 90, 50], arm: [58, 25], arm2: [58, 25] }),
      props: [FLOOR, { kind: "table", x1: 82, x2: 124, y: 50 }, { kind: "arrow", d: "M48 108 L48 90" }],
    },
  ],
  "straight-leg-raise": [
    { pose: supineStraight({ leg2: [-50, 65, 0] }), props: [MAT] },
    { pose: supineStraight({ leg2: [-50, 65, 0], leg: [-28, -28, -118] }), props: [MAT, { kind: "arrow", d: "M124 92 Q128 80 120 70" }] },
  ],
  "quad-sets": [
    { pose: supineStraight({ leg: [-6, 6, -90], leg2: [-6, 6, -90] }), props: [MAT, { kind: "towel", at: [97, 99] }] },
    { pose: supineStraight(), props: [MAT, { kind: "towel", at: [97, 101] }, { kind: "arrow", d: "M97 70 L97 87" }] },
  ],
  "ankle-pumps": [
    { pose: supineStraight({ leg: [0, 0, -125], leg2: [0, 0, -125] }), props: [MAT, { kind: "arrow", d: "M128 86 Q128 76 118 76" }] },
    { pose: supineStraight({ leg: [0, 0, -35], leg2: [0, 0, -35] }), props: [MAT, { kind: "arrow", d: "M112 78 Q126 76 128 88" }] },
  ],
  bridging: [
    { pose: supineBent(), props: [MAT] },
    {
      pose: supineBent({ hip: [72, 80], torso: 153, head: 180, leg: [-10, 86, 0], leg2: [-10, 86, 0], arm: [-3, 0] }),
      props: [MAT, { kind: "arrow", d: "M62 99 L62 82" }],
    },
  ],
  clamshell: [
    {
      pose: { hip: [62, 90], torso: 180, arm: [8, 0], leg: [0, 0, 0], leg2: [0, 0, 0],
        pin: { knee2: [90, 94], ankle2: [70, 99], toe2: [63, 101], knee: [90, 89], ankle: [70, 96], toe: [63, 97] } },
      props: [MAT],
    },
    {
      pose: { hip: [62, 90], torso: 180, arm: [8, 0], leg: [0, 0, 0], leg2: [0, 0, 0],
        pin: { knee2: [90, 94], ankle2: [70, 99], toe2: [63, 101], knee: [85, 70], ankle: [70, 96], toe: [63, 97] } },
      props: [MAT, { kind: "arrow", d: "M98 88 Q100 76 92 68" }],
    },
  ],
  "pelvic-tilt": [
    { pose: supineBent(), props: [MAT, { kind: "gap", d: "M50 99 Q58 92 67 99" }] },
    { pose: supineBent({ hip: [72, 97], torso: 178 }), props: [MAT, { kind: "arrow", d: "M58 74 L58 90" }] },
  ],
  pendulum: [
    {
      pose: { hip: [80, 59], torso: -140, leg: [90, 90, 0], leg2: [90, 90, 0], arm: [90, 90], arm2: [125, 110] },
      props: [FLOOR, { kind: "table", x1: 6, x2: 46, y: 70 }],
    },
    {
      pose: { hip: [80, 59], torso: -140, leg: [90, 90, 0], leg2: [90, 90, 0], arm: [96, 96], arm2: [125, 110] },
      props: [FLOOR, { kind: "table", x1: 6, x2: 46, y: 70 }, { kind: "circle", at: [56, 78], r: 9 }],
    },
  ],
  "wall-slides": [
    { pose: standing(61, { arm: [0, 0], arm2: [0, 0] }), props: [FLOOR, { kind: "wall", x: 95 }] },
    {
      pose: standing(61, { arm: [-25, -40], arm2: [-25, -40], pin: { hand: [92, 9] } }),
      props: [FLOOR, { kind: "wall", x: 95 }, { kind: "arrow", d: "M104 40 L104 12" }],
    },
  ],
  "chin-tucks": [
    { pose: sitting({ headShift: [5, 1] }), props: [FLOOR, CHAIR] },
    { pose: sitting({ headShift: [-3, 0] }), props: [FLOOR, CHAIR, { kind: "arrow", d: "M86 38 L70 38" }] },
  ],
  "seated-march": [
    { pose: sitting(), props: [FLOOR, CHAIR] },
    { pose: sitting({ leg: [-25, 90, 0] }), props: [FLOOR, CHAIR, { kind: "arrow", d: "M96 92 L96 70" }] },
  ],
};
