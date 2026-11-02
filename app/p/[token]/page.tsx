import MyPassport from "./MyPassport";

export default async function Page({ params }: PageProps<"/p/[token]">) {
  const { token } = await params;
  return <MyPassport token={token} />;
}

// Rendered per request: the page depends on the URL.
export const instant = false;
