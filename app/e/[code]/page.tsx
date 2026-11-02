import { T } from "@/components/Bi";
import ExerciseView, { sharedName } from "@/components/ExerciseView";
import { decodeExercise } from "@/lib/share";

// Patient-facing page opened from an exercise QR code. No login, no stored
// data: everything shown here comes from the link itself.
export default async function ExercisePage({ params }: PageProps<"/e/[code]">) {
  const { code } = await params;
  const decoded = decodeExercise(code);

  if (!decoded) {
    return (
      <main className="patient">
        <div className="patient-card">
          <h1><T lang="both" k="badLink" /></h1>
          <p><T lang="both" k="badLinkBody" /></p>
        </div>
      </main>
    );
  }

  const { ex, lang } = decoded;
  return (
    <main className="patient">
      <header className="patient-band">
        <small><T lang={lang} k="brand" /></small>
        <h1>{sharedName(ex, lang)}</h1>
      </header>
      <div className="patient-card">
        <ExerciseView ex={ex} lang={lang} />
        <p className="remind"><T lang={lang} k="rememberTick" /></p>
      </div>
    </main>
  );
}

// Rendered per request: the page depends on the URL.
export const instant = false;
