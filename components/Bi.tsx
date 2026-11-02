import { dict, langs, type TKey } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/** A dictionary string in the patient's language; "both" shows Punjabi with English underneath. */
export function T({ lang, k }: { lang: Lang; k: TKey }) {
  return <Pair lang={lang} en={String(dict("en")[k])} pa={String(dict("pa")[k])} />;
}

/** Any en/pa pair of strings, rendered the same way as `T`. */
export function Pair({ lang, en, pa }: { lang: Lang; en: string; pa: string }) {
  if (lang === "en") return <>{en}</>;
  if (lang === "pa" || en === pa) return <span lang="pa">{pa}</span>;
  return (
    <>
      <span lang="pa">{pa}</span>
      <span className="bi-en"> {en}</span>
    </>
  );
}

/** Plain text for attributes etc.: first language only. */
export function t(lang: Lang, k: TKey): string {
  return String(dict(langs(lang)[0])[k]);
}
