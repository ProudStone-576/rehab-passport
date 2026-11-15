import Nav from "@/components/Nav";
import { StoreProvider } from "@/lib/store";

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Nav>{children}</Nav>
    </StoreProvider>
  );
}
