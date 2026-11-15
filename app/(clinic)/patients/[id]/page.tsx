import PatientView from "./PatientView";

export default async function Page({ params, searchParams }: PageProps<"/patients/[id]">) {
  const { id } = await params;
  const { tab } = await searchParams;
  return <PatientView id={id} tab={typeof tab === "string" ? tab : ""} />;
}

// Rendered per request: the page depends on the URL.
export const instant = false;
