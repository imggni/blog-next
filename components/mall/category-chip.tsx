import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { MallCategory } from "@/types/mall";

type CategoryChipProps = {
  category: MallCategory;
  href: string;
};

export function CategoryChip({ category, href }: CategoryChipProps) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={href} className="gap-2">
        <span aria-hidden="true">{category.icon ?? "🏷️"}</span>
        <span>{category.name}</span>
      </Link>
    </Button>
  );
}
