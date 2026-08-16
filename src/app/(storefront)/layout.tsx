import { TopBar } from "@/components/storefront/top-bar";
import { Footer } from "@/components/storefront/footer";
import { StoreClosedNotice } from "@/components/storefront/store-closed-notice";

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <StoreClosedNotice />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
