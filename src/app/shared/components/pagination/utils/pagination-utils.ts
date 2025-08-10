// pagination.util.ts
export interface PaginationState {
  totalPages: number;
  visible: number[];
  showStartEllipsis: boolean;
  showEndEllipsis: boolean;
  currentPage: number;
}

export function paginate(
  total: number,
  pageSize: number,
  page: number,
  maxButtons: number,
  edgeButtons: boolean
): PaginationState {
  const totalPages = Math.max(1, Math.ceil((total || 0) / Math.max(1, pageSize || 1)));
  const currentPage = clamp(page, 1, totalPages);
  const windowSize = Math.max(1, maxButtons || 1);

  // Caso trivial: solo un botón
  if (windowSize === 1) {
    return {
      totalPages,
      visible: [currentPage],
      showStartEllipsis: edgeButtons && currentPage > 1,
      showEndEllipsis: edgeButtons && currentPage < totalPages,
      currentPage
    };
  }

  // Sin bordes y caben todos
  if (!edgeButtons && totalPages <= windowSize) {
    return state(totalPages, range(1, totalPages), false, false, currentPage);
  }

  const reserveEdges = edgeButtons ? 2 : 0;
  if (totalPages <= windowSize + reserveEdges) {
    const vis = range(1, totalPages);
    return state(totalPages, vis, false, false, currentPage);
  }

  // Ventana centrada
  const half = Math.floor(windowSize / 2);
  let start = currentPage - half;
  let end = currentPage + (windowSize - half - 1);

  const minStart = edgeButtons ? 2 : 1;
  const maxEnd = edgeButtons ? totalPages - 1 : totalPages;

  if (start < minStart) { start = minStart; end = start + windowSize - 1; }
  if (end > maxEnd)     { end = maxEnd;     start = end - windowSize + 1; }

  const visible = range(start, end);
  const showStartEllipsis = start > minStart;
  const showEndEllipsis = end < maxEnd;

  return state(totalPages, visible, showStartEllipsis, showEndEllipsis, currentPage);
}

function state(
  totalPages: number,
  visible: number[],
  showStartEllipsis: boolean,
  showEndEllipsis: boolean,
  currentPage: number
): PaginationState {
  return { totalPages, visible, showStartEllipsis, showEndEllipsis, currentPage };
}

function range(a: number, b: number): number[] {
  if (b < a) return [];
  const out: number[] = new Array(b - a + 1);
  for (let i = 0; i < out.length; i++) out[i] = a + i;
  return out;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n || 0, min), max);
}
