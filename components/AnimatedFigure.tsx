"use client";

import { useEffect, useRef, useState } from "react";
import { FrameSvg, H, W, ACCENT, propEl } from "@/components/Figure";
import Icon from "@/components/Icon";
import { animate, holdFromText } from "@/lib/animation";
import { FIGURES } from "@/lib/figures";
import { dict, langs } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const PHASE_KEY = { start: "phStart", move: "phMove", hold: "phHold", return: "phReturn" } as const;

/**
 * A looping cartoon of the exercise, drawn live from the same stick figure as
 * the printed passport: no video file, no internet needed once the page is
 * open, and no spoken language to understand.
 */
export default function AnimatedFigure({
  exerciseId, reps = 10, hold, lang = "en", height = 200,
}: { exerciseId: string; reps?: number; hold?: string; lang?: Lang; height?: number }) {
  const frames = FIGURES[exerciseId];
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);
  const clock = useRef({ last: 0, time: 0 });

  useEffect(() => {
    // Respect the phone's "reduce motion" setting: start paused, play on tap.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- media query is only readable after mount
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    clock.current.last = performance.now();
    const tick = (now: number) => {
      const dt = (now - clock.current.last) / 1000;
      clock.current.last = now;
      clock.current.time += dt / (slow ? 1.7 : 1);
      setTime(clock.current.time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, slow]);

  if (!frames) return null;
  const l0 = langs(lang)[0];
  const d = dict(l0);
  const s = animate(exerciseId, time, reps, holdFromText(hold));
  const marker = `anim-arrow-${exerciseId}`;
  const back = frames[0].props.filter((p) => p.kind !== "arrow" && p.kind !== "circle" && p.kind !== "gap");
  const gaps = frames[0].props.filter((p) => p.kind === "gap");
  const arrows = frames[1].props.filter((p) => p.kind === "arrow" || p.kind === "circle");

  return (
    <div className="anim">
      <svg viewBox={`0 0 ${W} ${H}`} height={height} width={(height * W) / H} className="figure anim-svg" role="img"
        aria-label={`${d.animTitle}: ${exerciseId}`}>
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={ACCENT} />
          </marker>
        </defs>
        <g opacity={1 - s.progress}>{gaps.map((p, i) => propEl(p, 90 + i, marker))}</g>
        <FrameSvg frame={{ pose: s.pose, props: back }} x={0} marker={marker} />
        <g opacity={s.phase === "move" || s.phase === "hold" ? 0.35 + 0.65 * s.progress : 0}>
          {arrows.map((p, i) => propEl(p, 70 + i, marker))}
        </g>
      </svg>
      <div className="anim-bar">
        <span className="anim-rep" lang={l0}>{d.rep} <strong key={s.rep} className="pop">{s.rep}</strong> / {reps}</span>
        <span className="anim-phase" lang={l0}>{d[PHASE_KEY[s.phase]]}</span>
        <span className="grow" />
        <button type="button" className="btn small anim-btn" onClick={() => setSlow(!slow)} aria-pressed={slow} lang={l0}>
          {slow ? d.normalSpeed : d.slowSpeed}
        </button>
        <button type="button" className="btn small anim-btn" onClick={() => setPlaying(!playing)} lang={l0}>
          <Icon name={playing ? "pause" : "play"} size={16} />{playing ? d.pause : d.play}
        </button>
      </div>
    </div>
  );
}
