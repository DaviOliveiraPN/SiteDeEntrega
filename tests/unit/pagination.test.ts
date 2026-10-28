import { describe, expect, it } from 'vitest';
import { paginate } from '../../src/hooks/usePagination';

describe('paginate', () => {
  const items = Array.from({ length: 45 }, (_, i) => i);

  it('shows 20 per page', () => {
    expect(paginate(items, 1).visible).toHaveLength(20);
    expect(paginate(items, 2).visible).toHaveLength(40);
    expect(paginate(items, 3)).toEqual({ visible: items, hasMore: false });
  });

  it('reports when there is more', () => {
    expect(paginate(items, 2).hasMore).toBe(true);
    expect(paginate(items.slice(0, 20), 1).hasMore).toBe(false);
  });
});
