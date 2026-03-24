import { useState, useCallback, useMemo, useRef } from 'react';

interface UseVirtualScrollOptions {
  totalItems: number;
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
}

interface UseVirtualScrollResult {
  visibleRange: { start: number; end: number };
  totalHeight: number;
  offsetY: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useVirtualScroll({
  totalItems,
  itemHeight,
  containerHeight,
  buffer = 5,
}: UseVirtualScrollOptions): UseVirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const totalHeight = totalItems * itemHeight;

  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const start = Math.max(0, startIndex - buffer);
    const end = Math.min(totalItems - 1, startIndex + visibleCount + buffer);
    return { start, end };
  }, [scrollTop, totalItems, itemHeight, containerHeight, buffer]);

  const offsetY = visibleRange.start * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleRange,
    totalHeight,
    offsetY,
    onScroll,
    scrollContainerRef,
  };
}
