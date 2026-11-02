"use client";

import { useEffect, useState } from "react";
import { dict, langs } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

// Reads the exercise aloud with the phone's built-in text-to-speech, for
// patients who find reading hard. Punjabi voices are missing on many phones,
// so it falls back to English and says so.
export default function Listen({ lang, texts }: { lang: Lang; texts: Record<"en" | "pa", string> }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [note, setNote] = useState("");
  const first = langs(lang)[0];

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection after mount
    setSupported(true);
    speechSynthesis.getVoices(); // voices load lazily on some browsers
    return () => speechSynthesis.cancel();
  }, []);

  if (!supported) return null;

  function speak() {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const voices = speechSynthesis.getVoices();
    let use: "en" | "pa" = first;
    let voice = voices.find((v) => v.lang.toLowerCase().startsWith(use === "pa" ? "pa" : "en-in"));
    if (use === "pa" && !voice) {
      use = "en";
      setNote(dict(first).noVoice);
    } else setNote("");
    if (use === "en") voice = voices.find((v) => v.lang.toLowerCase().startsWith("en-in")) ?? voices.find((v) => v.lang.startsWith("en"));
    const u = new SpeechSynthesisUtterance(texts[use]);
    u.lang = use === "pa" ? "pa-IN" : "en-IN";
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.onend = u.onerror = () => setSpeaking(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    setSpeaking(true);
  }

  return (
    <div className="listen">
      <button type="button" className={speaking ? "btn listen-btn on" : "btn listen-btn"} onClick={speak}>
        {speaking ? dict(first).stop : dict(first).listen}
      </button>
      {note && <small className="muted">{note}</small>}
    </div>
  );
}
