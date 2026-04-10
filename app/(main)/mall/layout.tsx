import type { ReactNode } from "react";

import { MallNav } from "@/components/mall/mall-nav";

export default function MallLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <MallNav />
      {children}
    </div>
  );
}
