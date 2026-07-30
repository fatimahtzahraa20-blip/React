import { useMemo, useState } from "react";

export default function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  return {
    page: currentPage,
    pageSize,
    total: items.length,
    totalPages,
    paginatedItems,
    setPage: (nextPage) => setPage(Math.min(Math.max(nextPage, 1), totalPages)),
    resetPage: () => setPage(1),
  };
}
