import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { MallNav } from "@/components/mall/mall-nav";
import { Toaster } from "@/components/ui/sonner";

export default function MallLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MallNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
      </main>
      <Footer />
      <Toaster />
    </>
  );
}
