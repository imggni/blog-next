"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PagedPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void | Promise<void>;
  maxVisiblePages?: number;
  previousText?: string;
  nextText?: string;
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

export function PagedPagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  previousText = "上一页",
  nextText = "下一页",
}: PagedPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const half = Math.floor(maxVisiblePages / 2);
  const pages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text={previousText}
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

        {totalPages > maxVisiblePages && currentPage < totalPages - half ? (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}

        <PaginationItem>
          <PaginationNext
            text={nextText}
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
  );
}
