import { SiteHeader } from "@/components/site-header";

export default function BlogLayout({ children }: LayoutProps<"/blog">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">{children}</main>
    </>
  );
}
