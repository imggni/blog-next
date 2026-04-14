"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MallSearchProps = {
  inputClassName?: string;
  buttonClassName?: string;
};

export function MallSearch({ inputClassName, buttonClassName }: MallSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const targetHref = useMemo(() => {
    const normalized = keyword.trim();
    if (!normalized) {
      return "/mall/product";
    }

    const params = new URLSearchParams();
    params.set("keyword", normalized);
    return `/mall/product?${params.toString()}`;
  }, [keyword]);

  const handleGo = useCallback(() => {
    router.push(targetHref);
  }, [router, targetHref]);

  return (
    <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
      <Input
        placeholder="搜索你想要的数码配件"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleGo();
          }
        }}
        className={inputClassName}
      />
      <Button className={buttonClassName} onClick={handleGo}>
        立即发现
      </Button>
    </div>
  );
}
