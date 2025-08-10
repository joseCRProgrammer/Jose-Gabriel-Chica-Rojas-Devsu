import { paginate, PaginationState } from './pagination-utils';

describe('paginate()', () => {
  function expectState(
    total: number,
    pageSize: number,
    page: number,
    maxButtons: number,
    edgeButtons: boolean,
    expected: Partial<PaginationState>
  ) {
    const s = paginate(total, pageSize, page, maxButtons, edgeButtons);
    for (const [k, v] of Object.entries(expected)) {
      expect((s as any)[k]).toEqual(v);
    }
    return s;
  }

  describe('cálculo de totalPages y clamp de currentPage', () => {
    it('total 0 ó negativo ⇒ totalPages = 1; page fuera de rango se ajusta', () => {
      let s = paginate(0, 10, 5, 5, false);
      expect(s.totalPages).toBe(1);
      expect(s.currentPage).toBe(1);

      s = paginate(-50, 10, -3, 5, false);
      expect(s.totalPages).toBe(1);
      expect(s.currentPage).toBe(1);

      s = paginate(100, 10, 999, 5, false);
      expect(s.totalPages).toBe(10);
      expect(s.currentPage).toBe(10);

      s = paginate(100, 10, 0, 5, false);
      expect(s.totalPages).toBe(10);
      expect(s.currentPage).toBe(1);
    });

    it('pageSize <= 0 o falsy se trata como mínimo 1', () => {
      const s1 = paginate(100, 0 as unknown as number, 1, 5, false);
      expect(s1.totalPages).toBe(100);

      const s2 = paginate(100, NaN as unknown as number, 101, 5, false);
      expect(s2.totalPages).toBe(100);
      expect(s2.currentPage).toBe(100);
    });
  });

  describe('windowSize === 1 (caso trivial)', () => {
    it('sin edgeButtons: no elipsis, visible = [currentPage]', () => {
      const s = paginate(100, 10, 5, 1, false);
      expect(s.visible).toEqual([5]);
      expect(s.showStartEllipsis).toBe(false);
      expect(s.showEndEllipsis).toBe(false);
    });

    it('con edgeButtons: elipsis según posición', () => {
      let s = paginate(100, 10, 1, 1, true);
      expect(s.visible).toEqual([1]);
      expect(s.showStartEllipsis).toBe(false);
      expect(s.showEndEllipsis).toBe(true);

      s = paginate(100, 10, 5, 1, true);
      expect(s.visible).toEqual([5]);
      expect(s.showStartEllipsis).toBe(true);
      expect(s.showEndEllipsis).toBe(true);

      s = paginate(100, 10, 10, 1, true);
      expect(s.visible).toEqual([10]);
      expect(s.showStartEllipsis).toBe(true);
      expect(s.showEndEllipsis).toBe(false);
    });
  });

  describe('!edgeButtons y caben todos los botones', () => {
    it('totalPages <= windowSize: muestra todo sin elipsis', () => {
      const s = paginate(30, 10, 2, 5, false);
      expect(s.visible).toEqual([1, 2, 3]);
      expect(s.showStartEllipsis).toBe(false);
      expect(s.showEndEllipsis).toBe(false);
      expect(s.currentPage).toBe(2);
    });
  });

  describe('totalPages <= windowSize + reserveEdges (edgeButtons=true)', () => {
    it('muestra todo sin elipsis (reserveEdges = 2)', () => {
      const s = paginate(70, 10, 4, 5, true);
      expect(s.visible).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(s.showStartEllipsis).toBe(false);
      expect(s.showEndEllipsis).toBe(false);
    });
  });

  describe('ventana centrada (edgeButtons=false)', () => {
    it('cerca del inicio: ajusta start al mínimo y elipsis final', () => {
      const s = paginate(200, 10, 2, 5, false);
      expect(s.visible).toEqual([1, 2, 3, 4, 5]);
      expect(s.showStartEllipsis).toBe(false);
      expect(s.showEndEllipsis).toBe(true);
    });

    it('cerca del final: ajusta end al máximo y elipsis inicial', () => {
      const s = paginate(200, 10, 19, 5, false);
      expect(s.visible).toEqual([16, 17, 18, 19, 20]);
      expect(s.showStartEllipsis).toBe(true);
      expect(s.showEndEllipsis).toBe(false);
    });

    it('en el centro: elipsis a ambos lados', () => {
      const s = paginate(200, 10, 10, 5, false);
      expect(s.visible).toEqual([8, 9, 10, 11, 12]);
      expect(s.showStartEllipsis).toBe(true);
      expect(s.showEndEllipsis).toBe(true);
    });
  });

  describe('ventana centrada (edgeButtons=true)', () => {
    it('en el centro: respeta bordes (2..totalPages-1) y muestra elipsis en ambos lados', () => {
      const s = paginate(200, 10, 10, 5, true);
      expect(s.visible).toEqual([8, 9, 10, 11, 12]);
      expect(s.showStartEllipsis).toBe(true);
      expect(s.showEndEllipsis).toBe(true);
    });

    it('cerca del inicio: empieza en 2 y solo elipsis al final', () => {
      const s = paginate(200, 10, 2, 5, true);
      expect(s.visible).toEqual([2, 3, 4, 5, 6]);
      expect(s.showStartEllipsis).toBe(false);
      expect(s.showEndEllipsis).toBe(true);
    });

    it('cerca del final: termina en totalPages-1 y solo elipsis al inicio', () => {
      const s = paginate(200, 10, 19, 5, true);
      expect(s.visible).toEqual([15, 16, 17, 18, 19]);
      expect(s.showStartEllipsis).toBe(true);
      expect(s.showEndEllipsis).toBe(false);
    });
  });

  describe('robustez con parámetros límite', () => {
    it('maxButtons <= 0 se trata como 1 (ventana mínima)', () => {
      const s = paginate(100, 10, 3, 0 as unknown as number, false);
      expect(s.visible).toEqual([3]);
    });

    it('page NaN o undefined se clampa a 1', () => {
      const s1 = paginate(100, 10, NaN as unknown as number, 5, false);
      expect(s1.currentPage).toBe(1);
      const s2 = paginate(100, 10, undefined as unknown as number, 5, false);
      expect(s2.currentPage).toBe(1);
    });

    it('si totalPages es 1, siempre visible=[1] y sin elipsis', () => {
      const s = paginate(3, 10, 1, 5, true);
      expect(s.totalPages).toBe(1);
      expect(s.visible).toEqual([1]);
      expect(s.showStartEllipsis).toBe(false);
      expect(s.showEndEllipsis).toBe(false);
    });
  });

  describe('consistencia del estado devuelto', () => {
    it('las páginas visibles siempre están dentro de [1..totalPages] y ordenadas', () => {
      const cases: Array<[number, number, number, number, boolean]> = [
        [1000, 7, 33, 9, false],
        [1000, 7, 33, 9, true],
        [55, 10, 6, 3, false],
        [55, 10, 6, 3, true],
      ];

      for (const [total, size, page, maxB, edges] of cases) {
        const s = paginate(total, size, page, maxB, edges);
        expect(s.visible.length).toBeGreaterThan(0);
        expect(s.visible).toEqual([...s.visible].sort((a, b) => a - b));
        expect(s.visible[0]).toBeGreaterThanOrEqual(edges ? 1 : 1);
        expect(s.visible[s.visible.length - 1]).toBeLessThanOrEqual(s.totalPages);
        expect(s.currentPage).toBeGreaterThanOrEqual(1);
        expect(s.currentPage).toBeLessThanOrEqual(s.totalPages);
      }
    });
  });
});
