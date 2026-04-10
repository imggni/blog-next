import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { MallProduct } from "@/types/mall";

type ProductCardProps = {
  product: MallProduct;
  href: string;
};

export function ProductCard({ product, href }: ProductCardProps) {
  const hasDiscount = typeof product.originalPrice === "number" && product.originalPrice > product.price;

  return (
    <Card size="sm" className="transition-transform hover:-translate-y-0.5">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={product.mainImage}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant={tag === "下架" ? "destructive" : "secondary"}>
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="break-words">{product.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-primary">¥{product.price}</span>
            {hasDiscount ? (
              <span className="text-xs text-muted-foreground line-through">¥{product.originalPrice}</span>
            ) : null}
          </div>
          <span className="text-xs text-muted-foreground">销量 {product.sales}</span>
        </CardContent>
        <CardFooter className="justify-end">
          <span className="text-xs text-muted-foreground">查看详情</span>
        </CardFooter>
      </Link>
    </Card>
  );
}
