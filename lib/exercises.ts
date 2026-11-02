import type { Exercise } from "./types";

const STOP =
  "Stop and tell your therapist if you feel sharp or worsening pain, dizziness, chest pain or new swelling.";
const STOP_PA =
  "ਜੇ ਤੇਜ਼ ਜਾਂ ਵਧਦਾ ਦਰਦ, ਚੱਕਰ, ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਜਾਂ ਨਵੀਂ ਸੋਜ ਹੋਵੇ ਤਾਂ ਰੁਕ ਜਾਓ ਅਤੇ ਆਪਣੇ ਥੈਰੇਪਿਸਟ ਨੂੰ ਦੱਸੋ।";

const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;

// Illustrative library for the prototype. Instructions are generic examples,
// to be reviewed and approved by the treating therapist before use.
// Videos: short public demonstrations from hospitals / professional bodies,
// checked to exist and allow embedding on 2026-10-28.
export const BUILTIN_EXERCISES: Exercise[] = [
  {
    id: "sit-to-stand",
    name: "Sit-to-stand",
    area: "Lower limb",
    steps: [
      "Sit near the front of a firm chair, feet flat and hip-width apart.",
      "Lean forward slightly and push through both feet to stand up.",
      "Stand tall for a moment, then sit down slowly and with control.",
    ],
    precautions: `Use a stable chair against a wall. ${STOP}`,
    videoUrl: yt("ITv-_BkcrD0"),
    videoSource: "Baptist Health",
    pa: {
      name: "ਬੈਠ ਕੇ ਖੜ੍ਹੇ ਹੋਣਾ",
      steps: [
        "ਮਜ਼ਬੂਤ ਕੁਰਸੀ ਦੇ ਅਗਲੇ ਪਾਸੇ ਬੈਠੋ, ਪੈਰ ਜ਼ਮੀਨ 'ਤੇ ਸਿੱਧੇ ਅਤੇ ਥੋੜ੍ਹੇ ਖੁੱਲ੍ਹੇ ਰੱਖੋ।",
        "ਥੋੜ੍ਹਾ ਅੱਗੇ ਝੁਕੋ ਅਤੇ ਦੋਹਾਂ ਪੈਰਾਂ 'ਤੇ ਜ਼ੋਰ ਦੇ ਕੇ ਖੜ੍ਹੇ ਹੋਵੋ।",
        "ਇੱਕ ਪਲ ਸਿੱਧੇ ਖੜ੍ਹੇ ਰਹੋ, ਫਿਰ ਹੌਲੀ-ਹੌਲੀ ਕਾਬੂ ਨਾਲ ਬੈਠ ਜਾਓ।",
      ],
      precautions: `ਕੁਰਸੀ ਕੰਧ ਨਾਲ ਲਗਾ ਕੇ ਰੱਖੋ ਤਾਂ ਜੋ ਹਿੱਲੇ ਨਾ। ${STOP_PA}`,
    },
    builtin: true,
  },
  {
    id: "heel-raises",
    name: "Heel raises",
    area: "Lower limb",
    steps: [
      "Stand holding a counter or chair back for balance.",
      "Rise up onto your toes as high as is comfortable.",
      "Lower your heels slowly to the floor.",
    ],
    precautions: `Always keep a hand on support. ${STOP}`,
    videoUrl: yt("MW2WG5l-fYE"),
    videoSource: "Coury & Buehler Physical Therapy",
    pa: {
      name: "ਅੱਡੀਆਂ ਚੁੱਕਣਾ",
      steps: [
        "ਸੰਤੁਲਨ ਲਈ ਮੇਜ਼ ਜਾਂ ਕੁਰਸੀ ਦੀ ਪਿੱਠ ਫੜ ਕੇ ਖੜ੍ਹੇ ਹੋਵੋ।",
        "ਜਿੰਨਾ ਆਰਾਮ ਨਾਲ ਹੋ ਸਕੇ, ਪੰਜਿਆਂ ਦੇ ਭਾਰ ਉੱਪਰ ਉੱਠੋ।",
        "ਅੱਡੀਆਂ ਹੌਲੀ-ਹੌਲੀ ਜ਼ਮੀਨ 'ਤੇ ਵਾਪਸ ਲਿਆਓ।",
      ],
      precautions: `ਹਮੇਸ਼ਾ ਇੱਕ ਹੱਥ ਸਹਾਰੇ 'ਤੇ ਰੱਖੋ। ${STOP_PA}`,
    },
    builtin: true,
  },
  {
    id: "straight-leg-raise",
    name: "Straight leg raise",
    area: "Lower limb",
    steps: [
      "Lie on your back, one knee bent, the other leg straight.",
      "Tighten the thigh of the straight leg.",
      "Lift it to the height of the bent knee, then lower slowly.",
    ],
    precautions: `Keep your lower back relaxed on the bed. ${STOP}`,
    videoUrl: yt("U4L_6JEv9Jg"),
    videoSource: "Baptist Health",
    pa: {
      name: "ਸਿੱਧੀ ਲੱਤ ਚੁੱਕਣਾ",
      steps: [
        "ਪਿੱਠ ਦੇ ਭਾਰ ਲੇਟੋ, ਇੱਕ ਗੋਡਾ ਮੋੜੋ ਅਤੇ ਦੂਜੀ ਲੱਤ ਸਿੱਧੀ ਰੱਖੋ।",
        "ਸਿੱਧੀ ਲੱਤ ਦੇ ਪੱਟ ਨੂੰ ਕੱਸੋ।",
        "ਉਸਨੂੰ ਮੁੜੇ ਹੋਏ ਗੋਡੇ ਦੀ ਉਚਾਈ ਤੱਕ ਚੁੱਕੋ, ਫਿਰ ਹੌਲੀ-ਹੌਲੀ ਹੇਠਾਂ ਕਰੋ।",
      ],
      precautions: `ਕਮਰ ਦਾ ਹੇਠਲਾ ਹਿੱਸਾ ਬਿਸਤਰੇ 'ਤੇ ਢਿੱਲਾ ਰੱਖੋ। ${STOP_PA}`,
    },
    builtin: true,
  },
  {
    id: "quad-sets",
    name: "Static quadriceps",
    area: "Lower limb",
    steps: [
      "Sit or lie with your leg straight and a rolled towel under the knee.",
      "Push the back of the knee down into the towel, tightening the thigh.",
      "Hold, then relax fully.",
    ],
    precautions: STOP,
    videoUrl: yt("IF5eDfb8afM"),
    videoSource: "Baptist Health",
    pa: {
      name: "ਪੱਟ ਦੀ ਮਾਸਪੇਸ਼ੀ ਕੱਸਣਾ",
      steps: [
        "ਲੱਤ ਸਿੱਧੀ ਕਰਕੇ ਬੈਠੋ ਜਾਂ ਲੇਟੋ, ਗੋਡੇ ਹੇਠਾਂ ਲਪੇਟਿਆ ਹੋਇਆ ਤੌਲੀਆ ਰੱਖੋ।",
        "ਪੱਟ ਨੂੰ ਕੱਸਦੇ ਹੋਏ ਗੋਡੇ ਦੇ ਪਿਛਲੇ ਹਿੱਸੇ ਨਾਲ ਤੌਲੀਏ ਨੂੰ ਹੇਠਾਂ ਦਬਾਓ।",
        "ਰੋਕ ਕੇ ਰੱਖੋ, ਫਿਰ ਪੂਰੀ ਤਰ੍ਹਾਂ ਢਿੱਲਾ ਛੱਡੋ।",
      ],
      precautions: STOP_PA,
    },
    builtin: true,
  },
  {
    id: "ankle-pumps",
    name: "Ankle pumps",
    area: "Lower limb",
    steps: [
      "Sit or lie with your legs straight.",
      "Pull your toes up towards you, then point them away.",
      "Keep the movement smooth and rhythmic.",
    ],
    precautions: STOP,
    videoUrl: yt("1NA0N8F0Nds"),
    videoSource: "NHS Golden Jubilee",
    pa: {
      name: "ਗਿੱਟੇ ਉੱਪਰ-ਹੇਠਾਂ ਕਰਨਾ",
      steps: [
        "ਲੱਤਾਂ ਸਿੱਧੀਆਂ ਕਰਕੇ ਬੈਠੋ ਜਾਂ ਲੇਟੋ।",
        "ਪੈਰਾਂ ਦੀਆਂ ਉਂਗਲਾਂ ਆਪਣੇ ਵੱਲ ਖਿੱਚੋ, ਫਿਰ ਦੂਰ ਵੱਲ ਧੱਕੋ।",
        "ਹਰਕਤ ਨਰਮ ਅਤੇ ਇੱਕਸਾਰ ਤਾਲ ਵਿੱਚ ਰੱਖੋ।",
      ],
      precautions: STOP_PA,
    },
    builtin: true,
  },
  {
    id: "bridging",
    name: "Bridging",
    area: "Hip & back",
    steps: [
      "Lie on your back with knees bent and feet flat.",
      "Squeeze your buttocks and lift your hips off the bed.",
      "Hold briefly, then lower slowly.",
    ],
    precautions: `Do not arch the lower back. ${STOP}`,
    videoUrl: yt("B7kTkXDIMuE"),
    videoSource: "MedBridge",
    pa: {
      name: "ਬ੍ਰਿਜ (ਕੁੱਲ੍ਹੇ ਚੁੱਕਣਾ)",
      steps: [
        "ਗੋਡੇ ਮੋੜ ਕੇ ਅਤੇ ਪੈਰ ਬਿਸਤਰੇ 'ਤੇ ਸਿੱਧੇ ਰੱਖ ਕੇ ਪਿੱਠ ਦੇ ਭਾਰ ਲੇਟੋ।",
        "ਕੁੱਲ੍ਹਿਆਂ ਦੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਕੱਸੋ ਅਤੇ ਕੁੱਲ੍ਹੇ ਬਿਸਤਰੇ ਤੋਂ ਉੱਪਰ ਚੁੱਕੋ।",
        "ਥੋੜ੍ਹਾ ਰੁਕੋ, ਫਿਰ ਹੌਲੀ-ਹੌਲੀ ਹੇਠਾਂ ਆਓ।",
      ],
      precautions: `ਕਮਰ ਦੇ ਹੇਠਲੇ ਹਿੱਸੇ ਨੂੰ ਕਮਾਨ ਵਾਂਗ ਨਾ ਮੋੜੋ। ${STOP_PA}`,
    },
    builtin: true,
  },
  {
    id: "clamshell",
    name: "Clamshell",
    area: "Hip & back",
    steps: [
      "Lie on your side with knees bent and feet together.",
      "Keeping feet together, lift the top knee.",
      "Lower slowly without rolling your hips back.",
    ],
    precautions: STOP,
    videoUrl: yt("DAAjOdwZdks"),
    videoSource: "Baptist Health",
    pa: {
      name: "ਕਲੈਮਸ਼ੈੱਲ (ਪਾਸੇ ਲੇਟ ਕੇ ਗੋਡਾ ਖੋਲ੍ਹਣਾ)",
      steps: [
        "ਗੋਡੇ ਮੋੜ ਕੇ ਅਤੇ ਪੈਰ ਇਕੱਠੇ ਰੱਖ ਕੇ ਇੱਕ ਪਾਸੇ ਲੇਟੋ।",
        "ਪੈਰ ਇਕੱਠੇ ਰੱਖਦੇ ਹੋਏ ਉੱਪਰਲਾ ਗੋਡਾ ਚੁੱਕੋ।",
        "ਕੁੱਲ੍ਹੇ ਪਿੱਛੇ ਘੁਮਾਏ ਬਿਨਾਂ ਹੌਲੀ-ਹੌਲੀ ਹੇਠਾਂ ਕਰੋ।",
      ],
      precautions: STOP_PA,
    },
    builtin: true,
  },
  {
    id: "pelvic-tilt",
    name: "Pelvic tilt",
    area: "Hip & back",
    steps: [
      "Lie on your back with knees bent.",
      "Gently flatten your lower back into the bed by tightening your tummy.",
      "Hold, then relax.",
    ],
    precautions: STOP,
    videoUrl: yt("u0AJnVg0tcc"),
    videoSource: "Canadian Chiropractic Guideline Initiative",
    pa: {
      name: "ਪੇਡੂ ਝੁਕਾਉਣਾ (ਪੈਲਵਿਕ ਟਿਲਟ)",
      steps: [
        "ਗੋਡੇ ਮੋੜ ਕੇ ਪਿੱਠ ਦੇ ਭਾਰ ਲੇਟੋ।",
        "ਪੇਟ ਨੂੰ ਕੱਸ ਕੇ ਕਮਰ ਦੇ ਹੇਠਲੇ ਹਿੱਸੇ ਨੂੰ ਹੌਲੀ ਜਿਹੇ ਬਿਸਤਰੇ ਨਾਲ ਦਬਾਓ।",
        "ਰੋਕ ਕੇ ਰੱਖੋ, ਫਿਰ ਢਿੱਲਾ ਛੱਡੋ।",
      ],
      precautions: STOP_PA,
    },
    builtin: true,
  },
  {
    id: "pendulum",
    name: "Shoulder pendulum",
    area: "Upper limb",
    steps: [
      "Lean forward, supporting yourself with your good arm on a table.",
      "Let the other arm hang down relaxed.",
      "Gently swing it in small circles, then forwards and back.",
    ],
    precautions: `Let the arm swing, do not force it. ${STOP}`,
    videoUrl: yt("zY5nq68IxwA"),
    videoSource: "University Orthopedics",
    pa: {
      name: "ਮੋਢੇ ਦੀ ਪੈਂਡੂਲਮ ਕਸਰਤ",
      steps: [
        "ਠੀਕ ਬਾਂਹ ਨਾਲ ਮੇਜ਼ ਦਾ ਸਹਾਰਾ ਲੈ ਕੇ ਅੱਗੇ ਝੁਕੋ।",
        "ਦੂਜੀ ਬਾਂਹ ਨੂੰ ਢਿੱਲਾ ਕਰਕੇ ਹੇਠਾਂ ਲਟਕਣ ਦਿਓ।",
        "ਇਸਨੂੰ ਹੌਲੀ-ਹੌਲੀ ਛੋਟੇ ਚੱਕਰਾਂ ਵਿੱਚ, ਫਿਰ ਅੱਗੇ-ਪਿੱਛੇ ਝੁਲਾਓ।",
      ],
      precautions: `ਬਾਂਹ ਨੂੰ ਆਪਣੇ ਆਪ ਝੂਲਣ ਦਿਓ, ਜ਼ੋਰ ਨਾ ਲਗਾਓ। ${STOP_PA}`,
    },
    builtin: true,
  },
  {
    id: "wall-slides",
    name: "Wall slides",
    area: "Upper limb",
    steps: [
      "Stand facing a wall and place your hands on it at shoulder height.",
      "Slide your hands up the wall as far as is comfortable.",
      "Slide back down slowly.",
    ],
    precautions: `Stay within a comfortable range. ${STOP}`,
    videoUrl: yt("Eaj_NG5_hIo"),
    videoSource: "British Elbow & Shoulder Society",
    pa: {
      name: "ਕੰਧ 'ਤੇ ਹੱਥ ਸਰਕਾਉਣਾ",
      steps: [
        "ਕੰਧ ਵੱਲ ਮੂੰਹ ਕਰਕੇ ਖੜ੍ਹੇ ਹੋਵੋ ਅਤੇ ਹੱਥ ਮੋਢਿਆਂ ਦੀ ਉਚਾਈ 'ਤੇ ਕੰਧ 'ਤੇ ਰੱਖੋ।",
        "ਜਿੰਨਾ ਆਰਾਮ ਨਾਲ ਹੋ ਸਕੇ, ਹੱਥ ਕੰਧ 'ਤੇ ਉੱਪਰ ਵੱਲ ਸਰਕਾਓ।",
        "ਹੌਲੀ-ਹੌਲੀ ਵਾਪਸ ਹੇਠਾਂ ਸਰਕਾਓ।",
      ],
      precautions: `ਆਰਾਮਦਾਇਕ ਹੱਦ ਵਿੱਚ ਹੀ ਰਹੋ। ${STOP_PA}`,
    },
    builtin: true,
  },
  {
    id: "chin-tucks",
    name: "Chin tucks",
    area: "Neck",
    steps: [
      "Sit tall looking straight ahead.",
      "Gently draw your chin straight back, making a double chin.",
      "Hold, then relax.",
    ],
    precautions: STOP,
    videoUrl: yt("7rnlAVhAK-8"),
    videoSource: "AskDoctorJo",
    pa: {
      name: "ਠੋਡੀ ਪਿੱਛੇ ਖਿੱਚਣਾ",
      steps: [
        "ਸਿੱਧੇ ਬੈਠੋ ਅਤੇ ਸਾਹਮਣੇ ਦੇਖੋ।",
        "ਹੌਲੀ ਜਿਹੇ ਠੋਡੀ ਨੂੰ ਸਿੱਧਾ ਪਿੱਛੇ ਖਿੱਚੋ, ਜਿਵੇਂ ਦੋਹਰੀ ਠੋਡੀ ਬਣਦੀ ਹੈ।",
        "ਰੋਕ ਕੇ ਰੱਖੋ, ਫਿਰ ਢਿੱਲਾ ਛੱਡੋ।",
      ],
      precautions: STOP_PA,
    },
    builtin: true,
  },
  {
    id: "seated-march",
    name: "Seated marching",
    area: "Balance & mobility",
    steps: [
      "Sit upright in a firm chair.",
      "Lift one knee up, lower it, then lift the other.",
      "Keep a steady rhythm.",
    ],
    precautions: STOP,
    videoUrl: yt("XeIeEv38kcc"),
    videoSource: "JMC Rehab",
    pa: {
      name: "ਬੈਠ ਕੇ ਕਦਮ-ਤਾਲ",
      steps: [
        "ਮਜ਼ਬੂਤ ਕੁਰਸੀ 'ਤੇ ਸਿੱਧੇ ਬੈਠੋ।",
        "ਇੱਕ ਗੋਡਾ ਉੱਪਰ ਚੁੱਕੋ, ਹੇਠਾਂ ਕਰੋ, ਫਿਰ ਦੂਜਾ ਚੁੱਕੋ।",
        "ਇੱਕਸਾਰ ਤਾਲ ਰੱਖੋ।",
      ],
      precautions: STOP_PA,
    },
    builtin: true,
  },
];

export const AREAS = Array.from(new Set(BUILTIN_EXERCISES.map((e) => e.area)));
