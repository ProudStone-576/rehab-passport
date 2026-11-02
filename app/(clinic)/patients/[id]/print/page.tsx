import PrintPassport from "./PrintPassport";

export default async function Page({ params }: PageProps<"/patients/[id]/print">) {
  const { id } = await params;
  return <PrintPassport id={id} />;
}

// Rendered per request: the page depends on the URL.
export const instant = false;
