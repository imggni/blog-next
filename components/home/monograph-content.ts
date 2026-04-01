export interface CapabilityItem {
  title: string;
  description: string;
  icon: "github" | "share" | "sparkles";
}

export interface FeaturedWorkItem {
  name: string;
  category: string;
  description: string;
  ctaLabel: string;
}

export interface InsightItem {
  date: string;
  title: string;
  description: string;
}

export const navigationItems = ["首页", "商店", "项目", "博客", "关于"];

export const capabilityItems: CapabilityItem[] = [
  {
    title: "GitHub",
    description: "透明的开发节奏与版本记录，让协作过程清晰可追溯。",
    icon: "github",
  },
  {
    title: "社交媒体",
    description: "开放内容分发与作品传播节点，扩大数字品牌的触达半径。",
    icon: "share",
  },
  {
    title: "作品集",
    description: "为工作室与创作者提供可持续更新的项目展示空间。",
    icon: "sparkles",
  },
];

export const featuredWorks: FeaturedWorkItem[] = [
  {
    name: "Lumina",
    category: "建筑工作室",
    description:
      "专注于作品叙事与服务边界的官方网站，平衡了品牌调性、内容层级与转化路径。",
    ctaLabel: "查看项目",
  },
  {
    name: "Ethos",
    category: "品牌系统",
    description:
      "为一家新锐品牌建立从视觉资产到发布系统的基础设施，支持跨平台表达的一致性。",
    ctaLabel: "查看更多",
  },
];

export const insightItems: InsightItem[] = [
  {
    date: "Oct 24, 2024",
    title: "模板的诞生：在不对称中寻找秩序",
    description: "拆解内容层级与栅格逻辑，整理出适合内容型官网的通用框架。",
  },
  {
    date: "Sep 12, 2024",
    title: "2024 内容生产协作性",
    description: "结合团队协作与编辑流程，构建更稳定的发布与复用能力。",
  },
  {
    date: "Aug 05, 2024",
    title: "为何好设计也用老文本",
    description: "真实且可编辑的文本让页面更容易验证视觉节奏与阅读体验。",
  },
];
