import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ProductPaginationProps = {
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void | Promise<void>;
  maxVisiblePages?: number;
};

function getVisiblePages(currentPage: number, totalPages: number, maxVisiblePages: number) {
  const visibleCount = Math.min(maxVisiblePages, totalPages);

  return Array.from({ length: visibleCount }, (_, i) => {
    if (totalPages <= maxVisiblePages) {
      return i + 1;
    }

    const half = Math.floor(maxVisiblePages / 2);

    if (currentPage <= half + 1) {
      return i + 1;
    }

    if (currentPage >= totalPages - half) {
      return totalPages - (maxVisiblePages - 1) + i;
    }

    return currentPage - half + i;
  });
}

export function ProductPagination({
  total,
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const half = Math.floor(maxVisiblePages / 2);
  const pages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        共 <span className="font-medium">{total}</span> 个商品，第{" "}
        <span className="font-medium">{currentPage}</span> 页
        <span className="mx-1">/</span>共 <span className="font-medium">{totalPages}</span> 页
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="上一页"
              onClick={() => {
                if (currentPage > 1) {
                  onPageChange(currentPage - 1);
                }
              }}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pages.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                onClick={() => onPageChange(pageNum)}
                isActive={pageNum === currentPage}
                className="cursor-pointer"
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > maxVisiblePages && currentPage < totalPages - half && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              text="下一页"
              onClick={() => {
                if (currentPage < totalPages) {
                  onPageChange(currentPage + 1);
                }
              }}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
