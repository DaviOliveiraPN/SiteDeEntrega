import { useState } from 'react';

export const PAGE_SIZE = 20;

export function paginate<T>(items: T[], pages: number, pageSize = PAGE_SIZE): { visible: T[]; hasMore: boolean } {
  const count = Math.max(1, pages) * pageSize;
  return { visible: items.slice(0, count), hasMore: items.length > count };
}

/** "Show 20, then Ver mais". Remount (via `key`) to reset when the filter changes. */
export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [pages, setPages] = useState(1);
  const { visible, hasMore } = paginate(items, pages, pageSize);
  return { visible, hasMore, showMore: () => setPages((p) => p + 1) };
}
