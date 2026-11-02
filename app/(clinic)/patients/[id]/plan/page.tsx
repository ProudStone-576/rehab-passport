import PlanWizard from "./PlanWizard";

export default async function Page({ params }: PageProps<"/patients/[id]/plan">) {
  const { id } = await params;
  return <PlanWizard id={id} />;
}

// Rendered per request: the page depends on the URL.
export const instant = false;
