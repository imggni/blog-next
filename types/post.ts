export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export interface PostSummary extends PostFrontmatter {
  slug: string;
  excerpt: string;
}

export interface PostDetail extends PostSummary {
  content: string;
}
