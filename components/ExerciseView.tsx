import AnimatedFigure from "@/components/AnimatedFigure";
import Icon from "@/components/Icon";
import Listen from "@/components/Listen";
import { Pair, T } from "@/components/Bi";
import { doseIn, exName, exPrecautions, exSteps, langs } from "@/lib/i18n";
import { youtubeEmbed } from "@/lib/logic";
import type { SharedExercise } from "@/lib/share";
import type { Lang } from "@/lib/types";

export function sharedName(ex: SharedExercise, lang: Lang) {
  return <Pair lang={lang} en={ex.name} pa={exName(ex, "pa")} />;
}

function doseOf(ex: SharedExercise, l: "en" | "pa"): string {
  if (ex.sets === undefined) return ex.dose ?? "";
  return doseIn({ sets: ex.sets, reps: ex.reps ?? 0, perDay: ex.perDay ?? 1, hold: ex.hold ?? "" }, l);
}

export function sharedDose(ex: SharedExercise, lang: Lang) {
  return <Pair lang={lang} en={doseOf(ex, "en")} pa={doseOf(ex, "pa")} />;
}

/** Plain text of the whole exercise, for read-aloud. */
function spoken(ex: SharedExercise, l: "en" | "pa"): string {
  const steps = exSteps(ex, l).map((s, i) => `${i + 1}. ${s}`).join(" ");
  const prec = exPrecautions({ precautions: ex.defaultPrecautions, pa: ex.pa }, ex.precautions, l);
  return `${exName(ex, l)}. ${doseOf(ex, l)}. ${steps} ${prec}`;
}

/** Full exercise instructions for the patient's phone (QR page and "My passport"). */
export default function ExerciseView({ ex, lang, video = true }: { ex: SharedExercise; lang: Lang; video?: boolean }) {
  const embed = ex.videoUrl ? youtubeEmbed(ex.videoUrl) : null;
  const ls = langs(lang);
  return (
    <div className="exview">
      {ex.id && (
        <div className="figure-box anim-box">
          <h3 className="anim-title"><T lang={lang} k="animTitle" /></h3>
          <AnimatedFigure exerciseId={ex.id} reps={ex.reps ?? 10} hold={ex.hold} lang={lang} height={230} />
        </div>
      )}

      {ex.photos?.length ? (
        <div className="photo-steps">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URLs from the clinic */}
          {ex.photos.map((src, i) => <img key={i} src={src} alt={`${ex.name} step ${i + 1}`} />)}
        </div>
      ) : null}

      <Listen lang={lang} texts={{ en: spoken(ex, "en"), pa: spoken(ex, "pa") }} />

      <div className="dose-box">
        <small><T lang={lang} k="yourDose" /></small>
        <strong>{sharedDose(ex, lang)}</strong>
      </div>

      <h2><T lang={lang} k="howToDo" /></h2>
      {ls.map((l) => (
        <ol key={l} className={l === "en" && ls.length > 1 ? "steps big secondary" : "steps big"} lang={l}>
          {exSteps(ex, l).map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      ))}

      {ex.notes && <p className="px-note"><T lang={lang} k="noteFrom" /> {ex.notes}</p>}

      <div className="stop-box">
        <strong><T lang={lang} k="precautions" /></strong>
        {ls.map((l) => (
          <p key={l} lang={l} className={l === "en" && ls.length > 1 ? "secondary" : ""}>
            {exPrecautions({ precautions: ex.defaultPrecautions, pa: ex.pa }, ex.precautions, l)}
          </p>
        ))}
      </div>

      {video &&
        (embed ? (
          <>
            {ex.id && <h3 className="anim-title"><T lang={lang} k="realVideo" /></h3>}
            <div className="video">
              <iframe src={embed} title={`${ex.name} demonstration`} allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
            </div>
            {ex.videoSource && <p className="credit"><T lang={lang} k="videoCredit" /> {ex.videoSource}</p>}
          </>
        ) : ex.videoUrl ? (
          <a className="btn block-btn" href={ex.videoUrl} target="_blank" rel="noreferrer"><Icon name="play" /><T lang={lang} k="watch" /></a>
        ) : (
          <p className="muted small"><T lang={lang} k="noVideo" /></p>
        ))}
    </div>
  );
}
