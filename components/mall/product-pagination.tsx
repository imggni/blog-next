import { PagedPagination } from "@/components/ui/paged-pagination";

type ProductPaginationProps = {
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void | Promise<void>;
  maxVisiblePages?: number;
};

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

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        共 <span className="font-medium">{total}</span> 个商品，第{" "}
        <span className="font-medium">{currentPage}</span> 页
        <span className="mx-1">/</span>共 <span className="font-medium">{totalPages}</span> 页
      </div>
      <PagedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        maxVisiblePages={maxVisiblePages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
