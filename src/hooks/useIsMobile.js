import { useState, useEffect } from 'react';

/**
 * useIsMobile
 *
 * Trả về `true` nếu viewport width ≤ breakpoint (mặc định 767px).
 * Cập nhật tự động khi resize hoặc xoay màn hình.
 *
 * @param {number} breakpoint - px tối đa coi là mobile (default: 767)
 * @returns {boolean}
 *
 * @example
 * const isMobile = useIsMobile();        // ≤ 767px
 * const isTablet = useIsMobile(1199);    // ≤ 1199px
 */
export function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);

    // Sync ngay lập tức phòng trường hợp resize trước khi effect chạy
    setIsMobile(mq.matches);

    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
