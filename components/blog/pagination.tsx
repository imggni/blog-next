import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  query?: string;
}

function createHref(page: number, query?: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();

  return search ? `/blog?${search}` : "/blog";
}

export function Pagination({ currentPage, totalPages, query }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between rounded-2xl border border-border/70 bg-card px-5 py-4 text-sm">
      <Link
        href={createHref(Math.max(1, currentPage - 1), query)}
        aria-disabled={currentPage === 1}
        className={`rounded-lg px-3 py-2 transition-colors ${
          currentPage === 1
            ? "pointer-events-none text-muted-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        上一页
      </Link>
      <p className="text-muted-foreground">
        第 {currentPage} / {totalPages} 页
      </p>
      <Link
        href={createHref(Math.min(totalPages, currentPage + 1), query)}
        aria-disabled={currentPage === totalPages}
        className={`rounded-lg px-3 py-2 transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none text-muted-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        下一页
      </Link>
    </nav>
  );
}
