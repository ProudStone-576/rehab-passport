import PatientList from "./PatientList";

// The search and filter live in the URL, so a filtered list can be bookmarked or shared.
export default async function Page({ searchParams }: PageProps<"/patients">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  return <PatientList q={one(sp.q)} filter={one(sp.f)} />;
}

export const instant = false;
