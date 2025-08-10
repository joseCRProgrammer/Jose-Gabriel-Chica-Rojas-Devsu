import { paginate } from './pagination-utils';

describe('paginate', () => {
  it('centra ventana con elipsis a ambos lados', () => {
    const s = paginate(100, 10, 5, 5, true);
    expect(s.totalPages).toBe(10);
    expect(s.currentPage).toBe(5);
    expect(s.visible).toEqual([3, 4, 5, 6, 7]); // 5 botones
    expect(s.showStartEllipsis).toBe(true);
    expect(s.showEndEllipsis).toBe(true);
  });

  it('sin elipsis en extremos', () => {
    const s = paginate(20, 10, 1, 5, true);
    expect(s.visible).toEqual([1, 2]);
    expect(s.showStartEllipsis).toBe(false);
    expect(s.showEndEllipsis).toBe(false);
  });
});
