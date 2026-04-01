import { Badge } from "@/components/ui/badge";

const heroTags = ["咨询", "数字化", "合作中"];

export function MonographHero() {
  return (
    <section className="grid gap-10 px-4 py-8 sm:px-6 md:grid-cols-[minmax(0,1.2fr)_240px] md:gap-12 md:py-12">
      <div className="max-w-3xl">
        <h1 className="max-w-2xl text-[clamp(3rem,7vw,6rem)] font-medium leading-[0.92] tracking-[-0.06em] text-[#202722]">
          通过有意图的设计，
          <br />
          构建数字叙事。
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-[#6d736f] sm:text-[15px]">
          立足于手写与功能化的交汇点，以简洁干净的视觉秩序进入品牌表达系统，
          帮助工作室、创作者与内容团队建立可持续的网站体验。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {heroTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-full border-[#d9ddd6] bg-transparent px-3 py-1 text-[11px] text-[#6d736f]"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-start md:justify-end">
        <div className="aspect-square w-full max-w-[240px] border border-[#e2e5df] bg-[#eef0ea]" />
      </div>
    </section>
  );
}
