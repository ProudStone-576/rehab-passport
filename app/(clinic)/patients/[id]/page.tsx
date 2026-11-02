import PatientView from "./PatientView";

export default async function Page({ params }: PageProps<"/patients/[id]">) {
  const { id } = await params;
  return <PatientView id={id} />;
}

// Rendered per request: the page depends on the URL.
export const instant = false;
